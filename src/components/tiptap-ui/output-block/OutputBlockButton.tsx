import React from "react";
import { Terminal } from "lucide-react";
// import Button from "@/components/tiptap-ui-primitive/button/button";
import { Editor } from "@tiptap/react";
import Button from "../../tiptap-ui-primitive/button/button";

interface OutputBlockButtonProps {
  editor?: Editor | null;
}

const OutputBlockButton: React.FC<OutputBlockButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isActive = editor.isActive("outputBlock");

  const handleClick = () => {
    editor.chain().focus().toggleOutputBlock().run();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={isActive ? "is-active" : ""}
      tooltip="Output Block"
    >
      <Terminal className="tiptap-button-icon" size={16} />
    </Button>
  );
};

export default OutputBlockButton;
