import { Mark, mergeAttributes } from "@tiptap/core";
import "katex/dist/katex.min.css";

export interface MathOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    math: {
      /**
       * Set a math mark
       */
      setMath: (attributes?: { latex: string }) => ReturnType;
      /**
       * Toggle a math mark
       */
      toggleMath: (attributes?: { latex: string }) => ReturnType;
      /**
       * Unset a math mark
       */
      unsetMath: () => ReturnType;
    };
  }
}

export const MathExtension = Mark.create<MathOptions>({
  name: "mathematics",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "math-formula",
      },
    };
  },

  addAttributes() {
    return {
      latex: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => {
          if (!attributes.latex) {
            return {};
          }
          return {
            "data-latex": attributes.latex,
            "data-type": "math",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "math",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setMath:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleMath:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetMath:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
