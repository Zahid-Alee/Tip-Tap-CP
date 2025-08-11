import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "./ResizableImageView";

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
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
        caption?: string;
      }) => ReturnType;

      setImageAlign: (align: "left" | "center" | "right") => ReturnType;
      setImageLink: (href: string) => ReturnType;
      removeImageLink: () => ReturnType;
      setImageCaption: (caption: string) => ReturnType;
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
      caption: {
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

    const imgElement: any = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, attrs, {
        "data-align": align,
        "data-flip-x": flipX,
        "data-flip-y": flipY,
      }),
    ];

    // Wrap in figure if caption exists for semantic HTML output.
    const caption = HTMLAttributes.caption;

    const imageWithOptionalLink: any = href
      ? ([
          "a",
          {
            href: href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          imgElement,
        ] as any)
      : imgElement;

    if (caption) {
      return [
        "figure",
        { class: "tiptap-image-figure", "data-align": align },
        imageWithOptionalLink,
        ["figcaption", { class: "tiptap-image-caption" }, 0, caption],
      ] as any;
    }

    return imageWithOptionalLink as any;
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
      setImageCaption:
        (caption) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { caption });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
