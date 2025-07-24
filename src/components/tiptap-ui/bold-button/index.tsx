import React from "react";
import { Editor } from "@tiptap/react";
import { BoldIcon } from "../../tiptap-icons/bold-icon";

// Custom Bold Button Component
const BoldButton: React.FC<{ editor: Editor; size?: string }> = ({
  editor,
  size = "sm",
}) => {
  const isBold = React.useMemo(() => {
    const types = ["paragraph", "heading", "textStyle"];
    return types.some((type) => {
      const attrs = editor.getAttributes(type);
      return (
        attrs.fontWeight &&
        attrs.fontWeight !== "400" &&
        attrs.fontWeight !== "normal" &&
        attrs.fontWeight !== null
      );
    });
  }, [editor.state.selection]);

  const handleClick = () => {
    editor.commands.toggleBold();
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded transition-colors ${
        isBold
          ? "bg-blue-100 text-blue-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      } ${size === "sm" ? "text-sm" : ""}`}
      type="button"
      title="Bold (Ctrl+B)"
    >
      <BoldIcon className="w-4 h-4" />
    </button>
  );
};

export default BoldButton;
