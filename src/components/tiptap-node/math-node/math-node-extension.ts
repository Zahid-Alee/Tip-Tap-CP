import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MathNodeView } from "./math-node-view";
import "katex/dist/katex.min.css";

export interface MathNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathNode: {
      /**
       * Insert a math formula
       */
      insertMathFormula: (latex: string, isBlock?: boolean) => ReturnType;
    };
  }
}

export const MathNode = Node.create<MathNodeOptions>({
  name: "mathFormula",

  group: "inline",

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "math-formula-node",
      },
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => {
          return {
            "data-latex": attributes.latex,
          };
        },
      },
      isBlock: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-block") === "true",
        renderHTML: (attributes) => {
          return {
            "data-block": attributes.isBlock,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-latex]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertMathFormula:
        (latex: string, isBlock = false) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              latex,
              isBlock,
            },
          });
        },
    };
  },
});
