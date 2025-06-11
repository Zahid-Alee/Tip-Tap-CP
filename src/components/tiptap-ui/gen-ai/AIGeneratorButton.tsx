import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/tiptap-ui-primitive/tooltip";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Sparkles } from "lucide-react";

/**
 * AI Generator Button for the editor toolbar
 *
 * @param {Object} props
 * @param {Function} props.onClick - Function to trigger when the button is clicked
 * @param {boolean} props.isGenerating - Whether AI is currently generating content
 */
const AIGeneratorButton = ({ onClick, isGenerating = false }) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="ghost"
            size="icon"
            className={`relative tiptap-button-icon ${
              isGenerating ? "animate-pulse bg-purple-100" : ""
            }`}
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            {isGenerating && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isGenerating ? "Generating content..." : "Generate AI content"}
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default AIGeneratorButton;
