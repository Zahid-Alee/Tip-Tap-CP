import { Minus } from "lucide-react";
import Button from "../../tiptap-ui-primitive/button/button";

const HorizontalRuleButton: React.FC<{ editor: Editor }> = ({ editor }) => {
  const handleClick = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!editor.can().setHorizontalRule()}
      tooltip="Insert horizontal line"
      size="sm"
    >
      <Minus className="tiptap-button-icon" size={16} />
    </Button>
  );
};

export default HorizontalRuleButton;
