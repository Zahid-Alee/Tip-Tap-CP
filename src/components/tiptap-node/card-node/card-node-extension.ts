import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CardNodeComponent } from "./card-node-component.tsx";

export interface CardNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    cardNode: {
      /**
       * Insert a card component with specified variant
       */
      insertCard: (variant?: "dark" | "gray-outline") => ReturnType;
      /**
       * Set card variant
       */
      setCardVariant: (variant: "dark" | "gray-outline") => ReturnType;
      /**
       * Set card background color
       */
      setCardBackgroundColor: (color: string) => ReturnType;
      /**
       * Set card border color
       */
      setCardBorderColor: (color: string) => ReturnType;
      /**
       * Set card text color
       */
      setCardTextColor: (color: string) => ReturnType;
      /**
       * Set card width
       */
      setCardWidth: (width: string) => ReturnType;
      /**
       * Set card height
       */
      setCardHeight: (height: string) => ReturnType;
      /**
       * Set card size (width and height)
       */
      setCardSize: (size: { width?: string; height?: string }) => ReturnType;
      /**
       * Set multiple card colors at once
       */
      setCardColors: (colors: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
      }) => ReturnType;
      /**
       * Reset card to default variant styles
       */
      resetCardToVariant: (variant: "dark" | "gray-outline") => ReturnType;
    };
  }
}

export const CardNode = Node.create<CardNodeOptions>({
  name: "cardNode",

  group: "block",

  content: "block+",

  isolating: true,

  defining: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      variant: {
        default: "dark",
        parseHTML: (element) => element.getAttribute("data-variant") || "dark",
        renderHTML: (attributes) => {
          return {
            "data-variant": attributes.variant,
          };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor};`,
          };
        },
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.style.borderColor || null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {};
          return {
            style: `border-color: ${attributes.borderColor};`,
          };
        },
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.textColor) return {};
          return {
            style: `color: ${attributes.textColor};`,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width};`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.style.height || null,
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return {
            style: `height: ${attributes.height};`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { variant, backgroundColor, borderColor, textColor, width, height } =
      node.attrs;

    let style = "";
    if (backgroundColor) style += `background-color: ${backgroundColor}; `;
    if (borderColor) style += `border-color: ${borderColor}; `;
    if (textColor) style += `color: ${textColor}; `;
    if (width) style += `width: ${width}; `;
    if (height) style += `height: ${height}; `;

    return [
      "div",
      mergeAttributes(
        {
          "data-type": "card",
          "data-variant": variant,
          class: `tiptap-card tiptap-card--${variant}`,
          style: style.trim() || undefined,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      insertCard:
        (variant = "dark") =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "This is a card component. Add your content here.",
                  },
                ],
              },
            ],
          });
        },
      setCardVariant:
        (variant) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { variant });
        },
      setCardBackgroundColor:
        (color) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            backgroundColor: color,
          });
        },
      setCardBorderColor:
        (color) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { borderColor: color });
        },
      setCardTextColor:
        (color) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { textColor: color });
        },
      setCardColors:
        (colors) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, colors);
        },
      setCardWidth:
        (width) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { width });
        },
      setCardHeight:
        (height) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { height });
        },
      setCardSize:
        (size) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, size);
        },
      resetCardToVariant:
        (variant) =>
        ({ commands }) => {
          const variantStyles = {
            dark: {
              variant: "dark",
              backgroundColor: "#1a1a1a",
              borderColor: "#2a2a2a",
              textColor: "#f5f5f5",
            },
            "gray-outline": {
              variant: "gray-outline",
              backgroundColor: "transparent",
              borderColor: "#6b7280",
              textColor: null,
            },
          };
          return commands.updateAttributes(this.name, variantStyles[variant]);
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardNodeComponent, {
      className: "card-node-wrapper",
    });
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-k": () => this.editor.commands.insertCard("dark"),
      "Mod-Shift-Alt-k": () => this.editor.commands.insertCard("gray-outline"),
    };
  },
});

// Custom card extension with resize functionality like the table extension
export const CustomCardExtension = CardNode.configure({
  resizable: true,
});

export default CustomCardExtension;
