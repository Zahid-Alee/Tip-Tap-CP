import { Extension } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";

// LineHeight Extension (unchanged)
interface LineHeightOptions {
  types: string[];
  defaultHeight: string;
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultHeight: "1.5",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultHeight,
            parseHTML: (element: HTMLElement) => {
              const lineHeight = element.style.lineHeight;
              if (!lineHeight || lineHeight === "normal") {
                return this.options.defaultHeight;
              }
              return lineHeight;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const lineHeight = attributes.lineHeight;
              if (!lineHeight || lineHeight === this.options.defaultHeight) {
                return {};
              }
              return {
                style: `line-height: ${lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight: String(lineHeight) })
          );
        },
    };
  },
});

// WordSpacing Extension (unchanged)
interface WordSpacingOptions {
  types: string[];
  defaultSpacing: string;
}

export const WordSpacing = Extension.create<WordSpacingOptions>({
  name: "wordSpacing",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultSpacing: "0em",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          wordSpacing: {
            default: this.options.defaultSpacing,
            parseHTML: (element: HTMLElement) => {
              const wordSpacing = element.style.wordSpacing;
              if (!wordSpacing || wordSpacing === "normal") {
                return this.options.defaultSpacing;
              }
              return wordSpacing;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const wordSpacing = attributes.wordSpacing;
              if (!wordSpacing || wordSpacing === this.options.defaultSpacing) {
                return {};
              }
              return {
                style: `word-spacing: ${wordSpacing}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setWordSpacing:
        (wordSpacing: string) =>
        ({ commands }) => {
          let value = wordSpacing;
          if (!wordSpacing.includes("em") && !wordSpacing.includes("px")) {
            value = `${wordSpacing}px`;
          }
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { wordSpacing: value })
          );
        },
    };
  },
});

// LetterSpacing Extension (unchanged)
interface LetterSpacingOptions {
  types: string[];
  defaultSpacing: string;
}

export const LetterSpacing = Extension.create<LetterSpacingOptions>({
  name: "letterSpacing",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultSpacing: "0em",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: this.options.defaultSpacing,
            parseHTML: (element: HTMLElement) => {
              const letterSpacing = element.style.letterSpacing;
              if (!letterSpacing || letterSpacing === "normal") {
                return this.options.defaultSpacing;
              }
              return letterSpacing;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const letterSpacing = attributes.letterSpacing;
              if (
                !letterSpacing ||
                letterSpacing === this.options.defaultSpacing
              ) {
                return {};
              }
              return {
                style: `letter-spacing: ${letterSpacing}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (letterSpacing: string) =>
        ({ commands }) => {
          let value = letterSpacing;
          if (!letterSpacing.includes("em") && !letterSpacing.includes("px")) {
            value = `${letterSpacing}px`;
          }
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { letterSpacing: value })
          );
        },
    };
  },
});

// CORRECTED Bold Extension - Extends TextStyle for inline styling
interface BoldOptions {
  defaultWeight: string;
}

export const Bold = Extension.create<BoldOptions>({
  name: "bold",

  addOptions() {
    return {
      defaultWeight: "700",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontWeight: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const weight = element.style.fontWeight;
              if (weight && weight !== "normal" && weight !== "400") {
                // Convert named weights to numeric
                const namedWeights: Record<string, string> = {
                  bold: "700",
                  bolder: "800",
                  lighter: "300",
                };
                return namedWeights[weight] || weight;
              }
              return null;
            },
            renderHTML: (attributes: Record<string, any>) => {
              if (
                !attributes.fontWeight ||
                attributes.fontWeight === "400" ||
                attributes.fontWeight === "normal"
              ) {
                return {};
              }
              return {
                style: `font-weight: ${attributes.fontWeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontWeight:
        (fontWeight?: string) =>
        ({ commands }) => {
          const weight = fontWeight || this.options.defaultWeight;
          return commands.setMark("textStyle", { fontWeight: String(weight) });
        },

      toggleBold:
        () =>
        ({ commands, editor }) => {
          // Check if textStyle mark with fontWeight is active
          const currentAttributes = editor.getAttributes("textStyle");
          const currentWeight = currentAttributes.fontWeight;

          if (
            currentWeight &&
            currentWeight !== "400" &&
            currentWeight !== "normal" &&
            currentWeight !== null &&
            currentWeight !== undefined
          ) {
            // Set font weight to normal instead of removing it
            return commands.setMark("textStyle", {
              ...currentAttributes,
              fontWeight: "normal",
            });
          } else {
            // Apply bold with default weight
            return commands.setMark("textStyle", {
              ...currentAttributes,
              fontWeight: this.options.defaultWeight,
            });
          }
        },

      toggleFontWeight:
        (fontWeight?: string) =>
        ({ commands, editor }) => {
          const weight = fontWeight || this.options.defaultWeight;
          const currentAttributes = editor.getAttributes("textStyle");
          const currentWeight = currentAttributes.fontWeight;

          if (currentWeight === weight) {
            // Remove this specific weight
            if (Object.keys(currentAttributes).length === 1) {
              return commands.unsetMark("textStyle");
            } else {
              const newAttributes = { ...currentAttributes };
              delete newAttributes.fontWeight;
              return commands.setMark("textStyle", newAttributes);
            }
          } else {
            // Apply the specified weight
            return commands.setMark("textStyle", {
              ...currentAttributes,
              fontWeight: String(weight),
            });
          }
        },

      unsetFontWeight:
        () =>
        ({ commands, editor }) => {
          const currentAttributes = editor.getAttributes("textStyle");

          // If no textStyle attributes exist, nothing to do
          if (
            !currentAttributes ||
            Object.keys(currentAttributes).length === 0
          ) {
            return true;
          }

          // Create new attributes without fontWeight
          const newAttributes = { ...currentAttributes };
          delete newAttributes.fontWeight;

          // If no attributes remain after removing fontWeight, unset the entire mark
          if (Object.keys(newAttributes).length === 0) {
            return commands.unsetMark("textStyle");
          } else {
            // Otherwise, update the mark with remaining attributes
            // First unset the mark, then set it with new attributes to ensure clean update
            return commands
              .chain()
              .unsetMark("textStyle")
              .setMark("textStyle", newAttributes)
              .run();
          }
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor.commands.toggleBold(),
      "Mod-B": () => this.editor.commands.toggleBold(),
    };
  },
});
