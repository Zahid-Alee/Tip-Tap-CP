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
            parseHTML: (element: HTMLElement) =>
              element.style.lineHeight || this.options.defaultHeight,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.lineHeight) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
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
            parseHTML: (element: HTMLElement) =>
              element.style.wordSpacing || this.options.defaultSpacing,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.wordSpacing) {
                return {};
              }

              return {
                style: `word-spacing: ${attributes.wordSpacing}`,
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
          const value = wordSpacing.includes("em")
            ? wordSpacing
            : `${wordSpacing}em`;

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
            parseHTML: (element: HTMLElement) =>
              element.style.letterSpacing || this.options.defaultSpacing,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.letterSpacing) {
                return {};
              }

              return {
                style: `letter-spacing: ${attributes.letterSpacing}`,
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
          const value = letterSpacing.includes("em")
            ? letterSpacing
            : `${letterSpacing}em`;

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
              attrs.fontWeight !== "normal"
            );
          });

          if (hasBold) {
            // Remove bold by setting to normal weight
            return this.options.types.every((type) =>
              commands.updateAttributes(type, { fontWeight: "400" })
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
            commands.updateAttributes(type, { fontWeight: "400" })
          );
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor.commands.toggleFontWeight(),
      "Mod-B": () => this.editor.commands.toggleFontWeight(),
    };
  },
});
