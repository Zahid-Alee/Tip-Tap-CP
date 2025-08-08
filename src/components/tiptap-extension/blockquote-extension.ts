import { Node } from "@tiptap/core";
import { Blockquote } from "@tiptap/extension-blockquote";

export interface BlockquoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockquote: {
      /**
       * Set blockquote with custom attributes
       */
      setBlockquoteWithAttributes: (
        attributes?: Record<string, any>
      ) => ReturnType;
      /**
       * Update blockquote attributes
       */
      updateBlockquoteAttributes: (
        attributes: Record<string, any>
      ) => ReturnType;
    };
  }
}

export const EnhancedBlockquote = Blockquote.extend<BlockquoteOptions>({
  name: "blockquote",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: (element) => {
          const borderColor =
            element.style.borderLeftColor ||
            element.getAttribute("data-border-color");
          return borderColor || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {};
          return {
            "data-border-color": attributes.borderColor,
            style: `border-left: 0.25em solid ${attributes.borderColor} !important;`,
          };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => {
          const backgroundColor =
            element.style.backgroundColor ||
            element.getAttribute("data-background-color");
          return backgroundColor || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            "data-background-color": attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      textColor: {
        default: null,
        parseHTML: (element) => {
          const textColor =
            element.style.color || element.getAttribute("data-text-color");
          return textColor || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.textColor) return {};
          return {
            "data-text-color": attributes.textColor,
            style: `color: ${attributes.textColor}`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setBlockquoteWithAttributes:
        (attributes) =>
        ({ commands }) => {
          const success = commands.toggleWrap("blockquote");
          if (success && attributes) {
            return commands.updateAttributes("blockquote", attributes);
          }
          return success;
        },
      updateBlockquoteAttributes:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes("blockquote", attributes);
        },
    };
  },

  renderHTML({ HTMLAttributes, node }) {
    const { borderColor, backgroundColor, textColor } = node.attrs;

    let style = "";
    // Always set border-left properties to ensure consistent styling
    if (borderColor) {
      style += `border-left: 0.25em solid ${borderColor} !important; `;
    } else {
      // Set default border if no custom color
      style += `border-left: 0.25em solid #787c7b; `;
    }
    if (backgroundColor) style += `background-color: ${backgroundColor}; `;
    if (textColor) style += `color: ${textColor}; `;

    // Merge with existing style attribute
    const existingStyle = HTMLAttributes.style || "";
    const mergedStyle = existingStyle + style;

    return ["blockquote", { ...HTMLAttributes, style: mergedStyle }, 0];
  },
});

export default EnhancedBlockquote;
