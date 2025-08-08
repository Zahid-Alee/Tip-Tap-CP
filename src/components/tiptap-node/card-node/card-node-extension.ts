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
       * Set card border radius
       */
      setCardBorderRadius: (radius: string) => ReturnType;
      /**
       * Set multiple card colors at once
       */
      setCardColors: (colors: {
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        borderRadius?: string;
      }) => ReturnType;
      /**
       * Set card background image
       */
      setCardBackgroundImage: (imageUrl: string) => ReturnType;
      /**
       * Set card background overlay
       */
      setCardBackgroundOverlay: (colors: {
        overlayColor?: string;
        overlayOpacity?: number;
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
          return {};
        },
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.style.borderColor || null,
        renderHTML: (attributes) => {
          return {};
        },
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          return {};
        },
      },
      borderRadius: {
        default: null,
        parseHTML: (element) => element.style.borderRadius || null,
        renderHTML: (attributes) => {
          return {};
        },
      },
      width: {
        default: 300,
        parseHTML: (element) => {
          const width = element.style.width;
          return width ? parseInt(width) : 300;
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
      height: {
        default: 200,
        parseHTML: (element) => {
          const height = element.style.height;
          return height ? parseInt(height) : 200;
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
      backgroundImage: {
        default: null,
        parseHTML: (element) => {
          const bgImage = element.style.backgroundImage;
          if (bgImage && bgImage !== "none") {
            // Extract URL from CSS backgroundImage property
            const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            return match ? match[1] : null;
          }
          return null;
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
      overlayColor: {
        default: null,
        parseHTML: (element) => {
          const overlay = element.querySelector(".card-overlay") as HTMLElement;
          return overlay ? overlay.style.backgroundColor || null : null;
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
      overlayOpacity: {
        default: 0.5,
        parseHTML: (element) => {
          const overlay = element.querySelector(".card-overlay") as HTMLElement;
          if (overlay) {
            const opacity = overlay.style.opacity;
            return opacity ? parseFloat(opacity) : 0.5;
          }
          return 0.5;
        },
        renderHTML: (attributes) => {
          return {};
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
    const {
      variant,
      backgroundColor,
      borderColor,
      textColor,
      borderRadius,
      width,
      height,
      backgroundImage,
      overlayColor,
      overlayOpacity,
    } = node.attrs;

    // Build style string from individual color attributes and dimensions
    const styles: string[] = [];
    if (backgroundColor) styles.push(`background-color: ${backgroundColor}`);
    if (borderColor) styles.push(`border-color: ${borderColor}`);
    if (textColor) styles.push(`color: ${textColor}`);
    if (borderRadius) styles.push(`border-radius: ${borderRadius}`);
    if (width) styles.push(`width: ${width}px`);
    if (height) styles.push(`height: ${height}px`);
    if (backgroundImage) {
      styles.push(`background-image: url('${backgroundImage}')`);
      styles.push(`background-size: cover`);
      styles.push(`background-position: center`);
      styles.push(`background-repeat: no-repeat`);
    }

    const styleAttribute = styles.length > 0 ? styles.join("; ") : undefined;

    return [
      "div",
      mergeAttributes(
        {
          "data-type": "card",
          "data-variant": variant,
          class: `tiptap-card tiptap-card--${variant}`,
          ...(styleAttribute && { style: styleAttribute }),
          ...(backgroundImage &&
            overlayColor && {
              "data-overlay-color": overlayColor,
              "data-overlay-opacity": overlayOpacity || 0.5,
            }),
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
      setCardBorderRadius:
        (radius) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { borderRadius: radius });
        },
      setCardColors:
        (colors) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, colors);
        },
      setCardBackgroundImage:
        (imageUrl) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            backgroundImage: imageUrl,
          });
        },
      setCardBackgroundOverlay:
        (overlaySettings) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, overlaySettings);
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
