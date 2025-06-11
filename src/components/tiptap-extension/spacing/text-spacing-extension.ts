import { Extension, CommandProps } from '@tiptap/core';

interface LineHeightOptions {
  types: string[];
  defaultHeight: string;
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultHeight: '1.5',
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
            commands.updateAttributes(type, { lineHeight: String(lineHeight) }),
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
  name: 'wordSpacing',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultSpacing: '0em',
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
          const value = wordSpacing.includes('em')
            ? wordSpacing
            : `${wordSpacing}em`;

          return this.options.types.every((type) =>
            commands.updateAttributes(type, { wordSpacing: value }),
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
  name: 'letterSpacing',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultSpacing: '0em',
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
          const value = letterSpacing.includes('em')
            ? letterSpacing
            : `${letterSpacing}em`;

          return this.options.types.every((type) =>
            commands.updateAttributes(type, { letterSpacing: value }),
          );
        },
    };
  },
});
