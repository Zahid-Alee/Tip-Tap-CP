import * as React from "react";
import { useEffect, useState } from "react";
import { ChevronDown, Type } from "lucide-react";
import FontSelector, { FONTS } from "./FontSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover";
import { Editor } from "@tiptap/react";

interface FontPopoverProps {
  editor: Editor | null;
}

const FontPopover: React.FC<FontPopoverProps> = ({ editor }) => {
  const [selectedFont, setSelectedFont] = useState<string>("");

  // Update the selected font when the editor selection changes
  useEffect(() => {
    if (!editor) return;

    const updateFontFamily = () => {
      // Check for FontFamily extension first
      if (editor.isActive("textStyle")) {
        const currentFont = editor.getAttributes("textStyle").fontFamily || "";
        setSelectedFont(currentFont);
      } else if (editor.can().chain().focus().setFontFamily("")) {
        // Alternative way to get font if available
        try {
          const attrs = editor.getAttributes("fontFamily") || {};
          const currentFont = attrs.fontFamily || "";
          setSelectedFont(currentFont);
        } catch (e) {
          // If neither works, default to empty
          setSelectedFont("");
        }
      }
    };

    // Initial update
    updateFontFamily();

    // Subscribe to selection changes
    editor.on("selectionUpdate", updateFontFamily);
    editor.on("transaction", updateFontFamily);

    return () => {
      // Clean up event listeners
      editor.off("selectionUpdate", updateFontFamily);
      editor.off("transaction", updateFontFamily);
    };
  }, [editor]);

  const handleFontSelect = (fontValue: string) => {
    if (!editor) return;

    setSelectedFont(fontValue);

    try {
      if (fontValue === "") {
        // Check which command is available for unsetting the font
        if (editor.can().chain().focus().unsetFontFamily) {
          editor.chain().focus().unsetFontFamily().run();
        } else if (editor.can().chain().focus().setFontFamily) {
          // If unset doesn't exist, set to empty string
          editor.chain().focus().setFontFamily("").run();
        }
      } else {
        // Apply font styling - check which command is available
        if (editor.can().chain().focus().setFontFamily) {
          editor.chain().focus().setFontFamily(fontValue).run();
        }
      }
    } catch (error) {
      console.error("Error applying font family:", error);
      // Fall back to directly dispatching a command if possible
      try {
        editor.commands.setFontFamily(fontValue);
      } catch (e) {
        console.error(
          "Font family extension may not be properly configured:",
          e
        );
      }
    }
  };

  // Find display name for current font (used for the button label)
  const getFontDisplayName = (fontValue: string): string => {
    const font = FONTS.find((f) => f.value === fontValue);
    return font ? font.name : "Default";
  };

  if (!editor) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="toolbar-button flex items-center gap-1"
          title="Font Family"
          style={{ fontFamily: selectedFont || "inherit" }}
        >
          <Type className="icon w-4 h-4" />
          <span className="hidden md:inline text-xs overflow-hidden text-ellipsis max-w-[80px] whitespace-nowrap">
            {/* {getFontDisplayName(selectedFont)} */}
            <ChevronDown className="icon w-4 h-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="p-0 border shadow-md rounded-md overflow-hidden font-selector"
      >
        <FontSelector
          onFontSelect={handleFontSelect}
          selectedFont={selectedFont}
        />
      </PopoverContent>
    </Popover>
  );
};

export default FontPopover;
