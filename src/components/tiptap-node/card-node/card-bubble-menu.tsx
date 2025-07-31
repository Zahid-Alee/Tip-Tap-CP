import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import {
  CardColorPopover,
  DEFAULT_CARD_BACKGROUND_COLORS,
  DEFAULT_CARD_BORDER_COLORS,
  DEFAULT_CARD_TEXT_COLORS,
} from "../../tiptap-ui/font/CardColorPopup";
import "./card-bubble-menu.scss";

interface CardBubbleMenuProps {
  editor: Editor;
}

// Extended color sets for card styling
const EXTENDED_BACKGROUND_COLORS = [
  ...DEFAULT_CARD_BACKGROUND_COLORS,
  {
    label: "Light Blue",
    value: "#e0f2fe",
  },
  {
    label: "Light Green",
    value: "#f0fdfa",
  },
];

const EXTENDED_BORDER_COLORS = [...DEFAULT_CARD_BORDER_COLORS];

const EXTENDED_TEXT_COLORS = [...DEFAULT_CARD_TEXT_COLORS];

export const CardBubbleMenu: React.FC<CardBubbleMenuProps> = ({ editor }) => {
  const handleVariantChange = (variant: "dark" | "gray-outline") => {
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

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", variantStyles[variant])
      .run();
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        return editor.isActive("cardNode");
      }}
      className="card-bubble-menu"
      tippyOptions={{
        duration: 100,
        placement: "top",
        appendTo: () => document.body,
      }}
    >
      <div className="card-bubble-menu-content">
        {/* Quick preset buttons */}
        <button
          className="card-bubble-menu-btn"
          onClick={() => handleVariantChange("dark")}
          title="Dark Card"
        >
          <div className="card-variant-preview card-variant-preview--dark"></div>
          Dark
        </button>
        <button
          className="card-bubble-menu-btn"
          onClick={() => handleVariantChange("gray-outline")}
          title="Gray Outline Card"
        >
          <div className="card-variant-preview card-variant-preview--gray"></div>
          Gray
        </button>

        <div className="card-bubble-menu-separator"></div>

        {/* Background Color Picker */}
        <div className="card-color-picker-wrapper" title="Background Color">
          <CardColorPopover
            editor={editor}
            backgroundColors={EXTENDED_BACKGROUND_COLORS}
            colorType="background"
          />
        </div>

        {/* Text Color Picker */}
        <div className="card-color-picker-wrapper" title="Text Color">
          <CardColorPopover
            editor={editor}
            textColors={EXTENDED_TEXT_COLORS}
            colorType="text"
          />
        </div>

        {/* Border Color Picker */}
        <div className="card-color-picker-wrapper" title="Border Color">
          <CardColorPopover
            editor={editor}
            borderColors={EXTENDED_BORDER_COLORS}
            colorType="border"
          />
        </div>
      </div>
    </BubbleMenu>
  );
};

export default CardBubbleMenu;
