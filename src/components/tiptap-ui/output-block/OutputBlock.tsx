import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import OutputBlockComponent from "./OutputBlockComponent";

export const OutputBlock = Node.create({
  name: "outputBlock",

  group: "block",

  content: "text*",

  marks: "",

  defining: true,

  code: true, // Add this - it tells TipTap this is a code-like block

  addAttributes() {
    return {
      language: {
        default: "text",
        parseHTML: (element) => element.getAttribute("data-language"),
        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }
          return {
            "data-language": attributes.language,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="output-block"]',
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes, {
        "data-type": "output-block",
        class: "output-block",
      }),
      ["code", {}, 0],
    ];
  },

  addCommands() {
    return {
      setOutputBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleOutputBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, "paragraph", attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-o": () => this.editor.commands.toggleOutputBlock(),
      // Remove the Enter and Shift-Enter handlers - let TipTap handle them naturally
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(OutputBlockComponent);
  },
});
