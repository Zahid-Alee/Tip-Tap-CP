import React from "react";
import { Editor } from "@tiptap/react";
import { BoldIcon } from "../../tiptap-icons/bold-icon";

// Custom Bold Button Component
const BoldButton: React.FC<{ editor: Editor; size?: string }> = ({
  editor,
  size = "sm",
}) => {
  const isBold = React.useMemo(() => {
    // Check if textStyle mark has fontWeight attribute that indicates bold
    const textStyleAttrs = editor.getAttributes("textStyle");
    const fontWeight = textStyleAttrs.fontWeight;

    return (
      fontWeight &&
      fontWeight !== "400" &&
      fontWeight !== "normal" &&
      fontWeight !== null &&
      fontWeight !== undefined
    );
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
