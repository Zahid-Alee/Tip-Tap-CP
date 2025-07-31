import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import "./card-bubble-menu.scss";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button";

interface CardBubbleMenuProps {
  editor: Editor;
}

const colors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
];

// Color Button Component (following TextColorButton pattern)
const ColorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { activeColor?: string | null }
>(({ className, children, activeColor, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Select card background color"
      tooltip="Select card background color"
      ref={ref}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: activeColor || "#000000" }}
        />
        <span>Background</span>
      </div>
    </Button>
  );
});

// Color Content Component (following TextColorContent pattern)
function ColorContent({
  editor,
  colors = colors,
  onClose,
}: {
  editor?: Editor | null;
  colors?: typeof colors;
  onClose?: () => void;
}) {
  const handleColorSelect = (color: string) => {
    if (!editor) return;

    console.log("Color selected:", color); // Debug log
    console.log("Editor state:", editor.isActive("cardNode")); // Debug log

    if (color === "none") {
      // Reset to default variant background
      editor.chain().focus().setCardBackgroundColor("").run();
    } else {
      // Set card background color
      editor.chain().focus().setCardBackgroundColor(color).run();
    }
    onClose?.();
  };

  const getCurrentColor = () => {
    if (!editor) return null;
    // Get the card node's background color attribute
    const cardAttrs = editor.getAttributes("cardNode");
    console.log("Card attributes:", cardAttrs); // Debug log
    return cardAttrs.backgroundColor || null;
  };

  const activeColor = getCurrentColor();

  return (
    <div className="w-auto p-3">
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <Button
            key={color.value}
            type="button"
            role="menuitem"
            data-active-state={activeColor === color.value ? "on" : "off"}
            aria-label={`${color.name} background color`}
            tabIndex={-1}
            data-style="ghost"
            onClick={() => handleColorSelect(color.value)}
            className="w-8 h-8 rounded hover:scale-110 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border border-gray-200 p-0"
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <Button
          onClick={() => handleColorSelect("none")}
          aria-label="Remove background color"
          type="button"
          role="menuitem"
          data-style="ghost"
          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150"
        >
          Remove Background
        </Button>
      </div>
    </div>
  );
}

// Main Popover Component (following TextColorPopover pattern)
function ColorPopover({
  editor,
  ...props
}: {
  editor?: Editor | null;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getCurrentColor = () => {
    if (!editor) return null;
    // Get the card node's background color attribute
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.backgroundColor || null;
  };

  const activeColor = getCurrentColor();
  const isActive = editor?.isActive("cardNode") ?? false;

  console.log("Editor passed to ColorPopover:", !!editor); // Debug log
  console.log("Editor is editable:", editor?.isEditable); // Debug log
  console.log("Card node is active:", isActive); // Debug log

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          activeColor={activeColor}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Card background colors" className="w-auto">
        <ColorContent
          editor={editor}
          colors={colors}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

export const CardBubbleMenu: React.FC<CardBubbleMenuProps> = ({ editor }) => {
  console.log("CardBubbleMenu editor:", !!editor); // Debug log

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        const isCardActive = editor.isActive("cardNode");
        console.log("BubbleMenu shouldShow - cardNode active:", isCardActive); // Debug log
        return isCardActive;
      }}
      className="card-bubble-menu"
      tippyOptions={{
        duration: 100,
        placement: "top",
        appendTo: () => document.body,
        interactive: true,
        hideOnClick: false,
      }}
    >
      <ColorPopover editor={editor} />
    </BubbleMenu>
  );
};

ColorButton.displayName = "ColorButton";

export default CardBubbleMenu;
