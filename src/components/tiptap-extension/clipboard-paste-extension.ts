import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { handleImageUpload } from "../../lib/tiptap-utils";
import uploadManager from "../../hooks/use-upload-manager";

export interface ClipboardPasteOptions {
  /**
   * Function to handle the upload process for clipboard images.
   */
  upload?: (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
  ) => Promise<string>;
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void;
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (url: string) => void;
  /**
   * Maximum file size in bytes for clipboard images.
   * @default 5242880 (5MB)
   */
  maxSize?: number;
  /**
   * Allowed MIME types for clipboard images.
   * @default ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
   */
  allowedTypes?: string[];
}

/**
 * Converts a Blob to a File object
 */
function blobToFile(blob: Blob, filename: string = "clipboard-image"): File {
  const extension = blob.type.split("/")[1] || "png";
  const fileName = `${filename}.${extension}`;

  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/**
 * Checks if the clipboard contains image data
 */
function hasImageInClipboard(clipboardData: DataTransfer): boolean {
  const types = Array.from(clipboardData.types);
  return (
    types.some((type) => type.startsWith("image/")) ||
    Array.from(clipboardData.files).some((file) =>
      file.type.startsWith("image/")
    )
  );
}

/**
 * Extracts image data from clipboard
 */
async function getImageFromClipboard(
  clipboardData: DataTransfer
): Promise<File | null> {
  // First, check for files in clipboard
  const files = Array.from(clipboardData.files);
  const imageFile = files.find((file) => file.type.startsWith("image/"));

  if (imageFile) {
    return imageFile;
  }

  // Then check for image data in clipboard items
  const items = Array.from(clipboardData.items);
  const imageItem = items.find((item) => item.type.startsWith("image/"));

  if (imageItem && imageItem.getAsFile) {
    const file = imageItem.getAsFile();
    if (file) {
      return file;
    }
  }

  // Check for blob data
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      try {
        const blob = item.getAsFile();
        if (blob) {
          return blobToFile(blob, "clipboard-image");
        }
      } catch (error) {
        console.warn("Failed to get image from clipboard item:", error);
      }
    }
  }

  return null;
}

/**
 * Validates image file against size and type constraints
 */
function validateImageFile(
  file: File,
  options: ClipboardPasteOptions
): boolean {
  const {
    maxSize = 5242880,
    allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"],
  } = options;

  if (!allowedTypes.includes(file.type)) {
    options.onError?.(
      new Error(
        `File type ${
          file.type
        } is not allowed. Allowed types: ${allowedTypes.join(", ")}`
      )
    );
    return false;
  }

  if (file.size > maxSize) {
    options.onError?.(
      new Error(
        `File size ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(
          2
        )}MB`
      )
    );
    return false;
  }

  return true;
}

/**
 * TipTap extension for handling clipboard image paste
 */
export const ClipboardPaste = Extension.create<ClipboardPasteOptions>({
  name: "clipboardPaste",

  addOptions() {
    return {
      upload: (
        file: File,
        onProgress?: (event: { progress: number }) => void,
        abortSignal?: AbortSignal
      ) => handleImageUpload(file, {}, onProgress, abortSignal),
      onError: (error) => console.error("Clipboard paste error:", error),
      onSuccess: (url) => console.log("Clipboard paste success:", url),
      maxSize: 5242880, // 5MB
      allowedTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: new PluginKey("clipboardPaste"),
        props: {
          handlePaste: (view, event, slice) => {
            const clipboardData = event.clipboardData;

            if (!clipboardData) {
              return false;
            }

            // Check if clipboard contains image data
            if (!hasImageInClipboard(clipboardData)) {
              return false;
            }

            // Check if there's already an active upload
            if (uploadManager.hasActiveUpload()) {
              event.preventDefault();
              options.onError?.(
                new Error(
                  "Another image is currently uploading. Please wait for it to complete before pasting another image."
                )
              );
              return true;
            }

            // Prevent default paste behavior for images
            event.preventDefault();

            // Extract and handle image
            getImageFromClipboard(clipboardData)
              .then(async (imageFile) => {
                if (!imageFile) {
                  return;
                }

                // Validate the image file
                if (!validateImageFile(imageFile, options)) {
                  return;
                }

                try {
                  // Get current selection position
                  const { selection } = view.state;
                  const position = selection.$head.pos;

                  // Insert upload node with clipboard file and flag
                  const uploadKey = `clipboard_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                  const tempAttrs = {
                    accept: "image/*",
                    limit: 1,
                    maxSize: options.maxSize,
                    isFromClipboard: true,
                    clipboardFile: imageFile, // Pass the file directly
                    uploadKey: uploadKey,
                  };

                  const uploadNode =
                    view.state.schema.nodes.imageUpload?.create(tempAttrs);

                  if (uploadNode) {
                    view.dispatch(view.state.tr.insert(position, uploadNode));
                  }
                } catch (error) {
                  options.onError?.(
                    error instanceof Error
                      ? error
                      : new Error("Failed to upload clipboard image")
                  );
                }
              })
              .catch((error) => {
                options.onError?.(
                  error instanceof Error
                    ? error
                    : new Error("Failed to process clipboard image")
                );
              });

            return true;
          },
        },
      }),
    ];
  },
});

export default ClipboardPaste;
