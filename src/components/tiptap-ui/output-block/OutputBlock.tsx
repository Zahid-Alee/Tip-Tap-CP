import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import OutputBlockComponent from "./OutputBlockComponent";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    outputBlock: {
      /**
       * Set an output block
       */
      setOutputBlock: (attributes?: any) => ReturnType;
      /**
       * Toggle an output block
       */
      toggleOutputBlock: (attributes?: any) => ReturnType;
    };
  }
}

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
      class: {
        default: "output-block",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return {
            class: attributes.class,
          };
        },
      },
      "data-type": {
        default: "output-block",
        parseHTML: (element) => element.getAttribute("data-type"),
        renderHTML: (attributes) => {
          return {
            "data-type": attributes["data-type"] || "output-block",
          };
        },
      },
      "data-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes["data-id"]) {
            return {};
          }
          return {
            "data-id": attributes["data-id"],
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
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          return {
            language: element.getAttribute("data-language") || "text",
            class: element.getAttribute("class") || "output-block",
            "data-type": element.getAttribute("data-type") || "output-block",
            "data-id": element.getAttribute("data-id"),
          };
        },
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
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleOutputBlock:
        (attributes = {}) =>
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
