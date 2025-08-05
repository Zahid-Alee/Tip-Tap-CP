import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ResizableImageView } from "./ResizableImageView";

interface ClipboardImageHandlerOptions {
  upload: (file: File) => Promise<string>;
  onUploadStart?: () => void;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

function handleClipboardImage(
  view: any,
  file: File,
  options: ClipboardImageHandlerOptions
) {
  if (!options.upload) {
    options.onUploadError?.(new Error("Upload function not configured"));
    return;
  }

  const { selection } = view.state;
  const position = selection.$head.pos;

  // Show upload progress by inserting a temporary placeholder
  options.onUploadStart?.();

  // Upload the image
  options
    .upload(file)
    .then((url) => {
      if (url) {
        const filename =
          file.name.replace(/\.[^/.]+$/, "") || "clipboard-image";

        // Insert the image at the current position
        const imageNode = view.state.schema.nodes.resizableImage?.create({
          src: url,
          alt: filename,
          title: filename,
          width: null,
          height: null,
          align: "left",
        });

        if (imageNode) {
          view.dispatch(view.state.tr.insert(position, imageNode));
        }

        options.onUploadSuccess?.(url);
      }
    })
    .catch((error) => {
      options.onUploadError?.(error);
    });
}

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  enableClipboardPaste?: boolean;
  upload?: (file: File) => Promise<string>;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadError?: (error: Error) => void;
  onUploadSuccess?: (url: string) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add an image
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
        align?: "left" | "center" | "right";
        flipX?: boolean;
        flipY?: boolean;
        href?: string;
      }) => ReturnType;

      setImageAlign: (align: "left" | "center" | "right") => ReturnType;
      setImageLink: (href: string) => ReturnType;
      removeImageLink: () => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      enableClipboardPaste: true,
      upload: undefined,
      onUploadStart: undefined,
      onUploadProgress: undefined,
      onUploadError: undefined,
      onUploadSuccess: undefined,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      align: {
        default: "left",
      },
      flipX: {
        default: false,
      },
      flipY: {
        default: false,
      },
      href: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a img[src]", // Parse images inside anchor tags
        getAttrs: (element) => {
          const img = element as HTMLImageElement;
          const anchor = img.parentElement as HTMLAnchorElement;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width")
              ? parseInt(img.getAttribute("width")!, 10)
              : null,
            height: img.getAttribute("height")
              ? parseInt(img.getAttribute("height")!, 10)
              : null,
            align: img.getAttribute("data-align") || "left",
            flipX: img.getAttribute("data-flip-x") === "true",
            flipY: img.getAttribute("data-flip-y") === "true",
            href: anchor?.getAttribute("href"),
          };
        },
      },
      {
        tag: this.options.inline ? 'img[src]:not([src^="data:"])' : "img[src]",
        getAttrs: (element) => {
          const img = element as HTMLImageElement;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width")
              ? parseInt(img.getAttribute("width")!, 10)
              : null,
            height: img.getAttribute("height")
              ? parseInt(img.getAttribute("height")!, 10)
              : null,
            align: img.getAttribute("data-align") || "left",
            flipX: img.getAttribute("data-flip-x") === "true",
            flipY: img.getAttribute("data-flip-y") === "true",
            href: null, // No href for standalone images
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { align, flipX, flipY, href, ...attrs } = HTMLAttributes;

    const imgElement: [string, Record<string, any>] = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, attrs, {
        "data-align": align,
        "data-flip-x": flipX,
        "data-flip-y": flipY,
      }),
    ];

    if (href) {
      return [
        "a",
        {
          href: href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        imgElement,
      ];
    }

    return imgElement;
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageAlign:
        (align) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { align });
        },
      setImageLink:
        (href) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { href });
        },
      removeImageLink:
        () =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { href: null });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addProseMirrorPlugins() {
    if (!this.options.enableClipboardPaste || !this.options.upload) {
      return [];
    }

    const uploadFunction = this.options.upload;
    const onUploadStart = this.options.onUploadStart;
    const onUploadSuccess = this.options.onUploadSuccess;
    const onUploadError = this.options.onUploadError;

    return [
      new Plugin({
        key: new PluginKey("imageClipboardPaste"),
        props: {
          handlePaste: (view, event, slice) => {
            const clipboardData = event.clipboardData;

            if (!clipboardData) {
              return false;
            }

            // Check for image files in clipboard
            const files = Array.from(clipboardData.files);
            const imageFiles = files.filter((file) =>
              file.type.startsWith("image/")
            );

            if (imageFiles.length === 0) {
              // Check for image data in clipboard items
              const items = Array.from(clipboardData.items);
              const imageItems = items.filter((item) =>
                item.type.startsWith("image/")
              );

              if (imageItems.length === 0) {
                return false;
              }

              // Handle image items
              event.preventDefault();

              imageItems.forEach((item) => {
                const file = item.getAsFile();
                if (file) {
                  handleClipboardImage(view, file, {
                    upload: uploadFunction,
                    onUploadStart,
                    onUploadSuccess,
                    onUploadError,
                  });
                }
              });

              return true;
            }

            // Handle image files
            event.preventDefault();

            imageFiles.forEach((file) => {
              handleClipboardImage(view, file, {
                upload: uploadFunction,
                onUploadStart,
                onUploadSuccess,
                onUploadError,
              });
            });

            return true;
          },
        },
      }),
    ];
  },
});
