import React from "react";
import { Editor } from "@tiptap/react";
import { CardColorPopover } from "./CardColorPopup";

interface CardColorPickerDemoProps {
  editor: Editor | null;
}

/**
 * Demo component showing how to use CardColorPopover independently
 * This can be used in toolbars or other UI elements
 */
export const CardColorPickerDemo: React.FC<CardColorPickerDemoProps> = ({
  editor,
}) => {
  return (
    <div className="flex gap-2 p-4 border rounded-lg">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-gray-600">Background</span>
        <CardColorPopover
          editor={editor}
          colorType="background"
          hideWhenUnavailable={true}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-gray-600">Border</span>
        <CardColorPopover
          editor={editor}
          colorType="border"
          hideWhenUnavailable={true}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-gray-600">Text</span>
        <CardColorPopover
          editor={editor}
          colorType="text"
          hideWhenUnavailable={true}
        />
      </div>
    </div>
  );
};

export default CardColorPickerDemo;
