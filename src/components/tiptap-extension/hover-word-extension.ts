import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface HoverWordOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    hoverWord: {
      /**
       * Set a hover word mark
       */
      setHoverWord: (attributes: {
        word: string;
        title?: string;
        description?: string;
        metadata?: string;
      }) => ReturnType;
      /**
       * Toggle hover word mark
       */
      toggleHoverWord: (attributes: {
        word: string;
        title?: string;
        description?: string;
        metadata?: string;
      }) => ReturnType;
      /**
       * Unset hover word mark
       */
      unsetHoverWord: () => ReturnType;
    };
  }
}

export const HoverWord = Mark.create<HoverWordOptions>({
  name: "hoverWord",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      word: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-word"),
        renderHTML: (attributes) => {
          if (!attributes.word) {
            return {};
          }
          return {
            "data-word": attributes.word,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            "data-title": attributes.title,
          };
        },
      },
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-description"),
        renderHTML: (attributes) => {
          if (!attributes.description) {
            return {};
          }
          return {
            "data-description": attributes.description,
          };
        },
      },
      metadata: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-metadata"),
        renderHTML: (attributes) => {
          if (!attributes.metadata) {
            return {};
          }
          return {
            "data-metadata": attributes.metadata,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-hover-word="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-hover-word": "true",
        class: "hover-word",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setHoverWord:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleHoverWord:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetHoverWord:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.unsetHoverWord(),
    };
  },
});

export default HoverWord;
