import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import OutputBlockComponent from "./OutputBlockComponent";

export const OutputBlock = Node.create({
  name: "outputBlock",

  group: "block",

  content: "text*",

  marks: "",

  code: true,

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

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
        getAttrs: (element) => {
          return {
            language: element.getAttribute("data-language") || "text",
          };
        },
      },
      {
        tag: "pre.output-block",
        getAttrs: (element) => {
          return {
            language: element.getAttribute("data-language") || "text",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "pre",
      {
        ...HTMLAttributes,
        "data-type": "output-block",
        "data-language": node.attrs.language || "text",
        class: "output-block",
      },
      ["code", {}, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(OutputBlockComponent);
  },

  addCommands() {
    return {
      setOutputBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-o": () => this.editor.commands.setOutputBlock(),
    };
  },
});
