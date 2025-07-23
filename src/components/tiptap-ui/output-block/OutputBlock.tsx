import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import OutputBlockComponent from "./OutputBlockComponent";

export const OutputBlock = Node.create({
  name: "outputBlock",

  group: "block",

  content: "text*",

  marks: "",

  defining: true,

  code: true,

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
      // Add these attributes to ensure they're preserved
      "data-type": {
        default: "output-block",
        renderHTML: () => {
          return {
            "data-type": "output-block",
          };
        },
        parseHTML: (element) => element.getAttribute("data-type"),
      },
      class: {
        default: "output-block",
        renderHTML: () => {
          return {
            class: "output-block",
          };
        },
        parseHTML: (element) => element.getAttribute("class"),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="output-block"]',
        preserveWhitespace: "full",
      },
      // Also accept regular pre tags with output-block class as fallback
      {
        tag: "pre.output-block",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "pre",
      mergeAttributes(
        {
          "data-type": "output-block",
          class: "output-block",
        },
        HTMLAttributes
      ),
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
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(OutputBlockComponent);
  },
});
