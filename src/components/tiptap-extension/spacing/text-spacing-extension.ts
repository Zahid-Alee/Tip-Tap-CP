import { Extension, CommandProps } from "@tiptap/core";

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
              // If no line height is set or it's the default, return the default
              if (!lineHeight || lineHeight === "normal") {
                return this.options.defaultHeight;
              }
              return lineHeight;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const lineHeight = attributes.lineHeight;
              // Don't render if it's the default value
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
        ({ commands }: CommandProps) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight: String(lineHeight) })
          );
        },
    };
  },
});

// WordSpacing
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
              // If no word spacing is set or it's normal, return default
              if (!wordSpacing || wordSpacing === "normal") {
                return this.options.defaultSpacing;
              }
              return wordSpacing;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const wordSpacing = attributes.wordSpacing;
              // Don't render if it's the default value
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
        ({ commands }: CommandProps) => {
          // Support both em and px units, default to px if no unit is specified
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

// LetterSpacing
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
              // If no letter spacing is set or it's normal, return default
              if (!letterSpacing || letterSpacing === "normal") {
                return this.options.defaultSpacing;
              }
              return letterSpacing;
            },
            renderHTML: (attributes: Record<string, any>) => {
              const letterSpacing = attributes.letterSpacing;
              // Don't render if it's the default value
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
        ({ commands }: CommandProps) => {
          // Support both em and px units, default to px if no unit is specified
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

// Bold Extension

interface BoldOptions {
  types: string[];
  defaultWeight: string;
  HTMLAttributes: Record<string, any>;
}

export const Bold = Extension.create<BoldOptions>({
  name: "bold",

  addOptions() {
    return {
      types: ["paragraph", "heading", "textStyle"],
      defaultWeight: "700",
      HTMLAttributes: {},
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontWeight: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const weight = element.style.fontWeight;
              // Handle both numeric and named font weights
              if (weight) {
                // Convert named weights to numeric
                const namedWeights: Record<string, string> = {
                  normal: "400",
                  bold: "700",
                  bolder: "800",
                  lighter: "300",
                };
                return namedWeights[weight] || weight;
              }
              return null;
            },
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.fontWeight) {
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
        ({ commands }: CommandProps) => {
          const weight = fontWeight || this.options.defaultWeight;

          return this.options.types.every((type) =>
            commands.updateAttributes(type, { fontWeight: String(weight) })
          );
        },

      toggleBold:
        () =>
        ({ commands, editor }: CommandProps) => {
          // Check if any of the current selection has bold applied
          const hasBold = this.options.types.some((type) => {
            const attrs = editor.getAttributes(type);
            return (
              attrs.fontWeight &&
              attrs.fontWeight !== "400" &&
              attrs.fontWeight !== "normal" &&
              attrs.fontWeight !== null
            );
          });

          if (hasBold) {
            // Remove bold by setting to normal weight
            return this.options.types.every((type) =>
              commands.updateAttributes(type, { fontWeight: null })
            );
          } else {
            // Apply bold with default weight
            return this.options.types.every((type) =>
              commands.updateAttributes(type, {
                fontWeight: this.options.defaultWeight,
              })
            );
          }
        },

      toggleFontWeight:
        (fontWeight?: string) =>
        ({ commands, editor }: CommandProps) => {
          const weight = fontWeight || this.options.defaultWeight;

          // Check if any of the current selection has bold applied
          const hasBold = this.options.types.some((type) => {
            const attrs = editor.getAttributes(type);
            return (
              attrs.fontWeight &&
              attrs.fontWeight !== "400" &&
              attrs.fontWeight !== "normal" &&
              attrs.fontWeight !== null
            );
          });

          if (hasBold) {
            // Remove bold by setting to null
            return this.options.types.every((type) =>
              commands.updateAttributes(type, { fontWeight: null })
            );
          } else {
            // Apply bold with specified weight
            return this.options.types.every((type) =>
              commands.updateAttributes(type, { fontWeight: String(weight) })
            );
          }
        },

      unsetFontWeight:
        () =>
        ({ commands }: CommandProps) => {
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { fontWeight: null })
          );
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
