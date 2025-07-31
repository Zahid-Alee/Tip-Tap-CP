import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { Settings } from "lucide-react";
import "./card-bubble-menu.scss";

interface CardBubbleMenuProps {
  editor: Editor;
}

export const CardBubbleMenu: React.FC<CardBubbleMenuProps> = ({ editor }) => {
  const handleVariantChange = (variant: "dark" | "gray-outline") => {
    const variantStyles = {
      dark: {
        variant: "dark",
        backgroundColor: "#1a1a1a", // off-black
        borderColor: "#2a2a2a", // off-black border
        textColor: "#f5f5f5", // off-white text
      },
      "gray-outline": {
        variant: "gray-outline",
        backgroundColor: "transparent",
        borderColor: "#6b7280", // gray border
        textColor: null, // inherit text color
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
    >
      <div className="card-bubble-menu-content">
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
      </div>
    </BubbleMenu>
  );
};

export default CardBubbleMenu;
