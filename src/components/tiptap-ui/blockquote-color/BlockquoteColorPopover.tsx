import * as React from "react";
import { Editor } from "@tiptap/react";

// --- Hooks ---
import { useMenuNavigation } from "../../../hooks/use-menu-navigation";
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { BlockQuoteIcon } from "../../tiptap-icons/block-quote-icon";
import { BanIcon } from "../../tiptap-icons/ban-icon";
import { Plus } from "lucide-react";

// --- UI Primitives ---
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../tiptap-ui-primitive/popover";
import { Separator } from "../../tiptap-ui-primitive/separator";

// --- Styles ---
import "../highlight-popover/highlight-popover.scss";

export interface BlockquoteColor {
  label: string;
  value: string;
  backgroundColor?: string;
  textColor?: string;
}

export const DEFAULT_BLOCKQUOTE_COLORS: BlockquoteColor[] = [
  {
    label: "Green",
    value: "#22c55e",
    backgroundColor: "#f0fdf4",
    textColor: "#15803d",
  },
  {
    label: "Blue",
    value: "#3b82f6",
    backgroundColor: "#eff6ff",
    textColor: "#1e40af",
  },
  {
    label: "Red",
    value: "#ef4444",
    backgroundColor: "#fef2f2",
    textColor: "#dc2626",
  },
  {
    label: "Purple",
    value: "#a855f7",
    backgroundColor: "#faf5ff",
    textColor: "#9333ea",
  },
  {
    label: "Yellow",
    value: "#eab308",
    backgroundColor: "#fefce8",
    textColor: "#a16207",
  },
  {
    label: "Orange",
    value: "#f97316",
    backgroundColor: "#fff7ed",
    textColor: "#c2410c",
  },
  {
    label: "Gray",
    value: "#6b7280",
    backgroundColor: "#f9fafb",
    textColor: "#374151",
  },
];

export const useBlockquoteColor = (editor: Editor | null) => {
  const getActiveColor = React.useCallback(() => {
    if (!editor || !editor.isActive("blockquote")) return null;
    const attrs = editor.getAttributes("blockquote");
    return attrs.borderColor || null;
  }, [editor]);

  const applyBlockquoteColor = React.useCallback(
    (color: BlockquoteColor | "reset") => {
      if (!editor) return;

      if (color === "reset") {
        editor
          .chain()
          .focus()
          .updateBlockquoteAttributes({
            borderColor: null,
            backgroundColor: null,
            textColor: null,
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .updateBlockquoteAttributes({
            borderColor: color.value,
            backgroundColor: color.backgroundColor || null,
            textColor: color.textColor || null,
          })
          .run();
      }
    },
    [editor]
  );

  return {
    getActiveColor,
    applyBlockquoteColor,
  };
};

export function CustomColorInput({
  onSelectColor,
}: {
  onSelectColor: (color: string) => void;
}) {
  const [customColor, setCustomColor] = React.useState("#000000");

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleApply = () => {
    onSelectColor(customColor);
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="color"
        value={customColor}
        onChange={handleColorChange}
        className="w-8 h-8 rounded cursor-pointer border-0"
        aria-label="Select custom color"
      />
      <input
        type="text"
        value={customColor}
        onChange={handleColorChange}
        className="w-20 px-2 py-1 text-sm border rounded"
        aria-label="Custom color hex value"
      />
      <Button
        onClick={handleApply}
        type="button"
        data-style="solid"
        className="px-2 py-1 text-sm"
        aria-label="Apply custom color"
      >
        Apply
      </Button>
    </div>
  );
}

export function BlockquoteColorContent({
  editor: providedEditor,
  colors = DEFAULT_BLOCKQUOTE_COLORS,
  onClose,
}: {
  editor?: Editor | null;
  colors?: BlockquoteColor[];
  onClose?: () => void;
}) {
  const editor = useTiptapEditor(providedEditor);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { getActiveColor, applyBlockquoteColor } = useBlockquoteColor(editor);
  const activeColor = getActiveColor();
  const [showCustomColorInput, setShowCustomColorInput] = React.useState(false);

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  );

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (item.value === "none") {
        applyBlockquoteColor("reset");
      } else {
        const color = colors.find((c) => c.value === item.value);
        if (color) applyBlockquoteColor(color);
      }
      onClose?.();
    },
    onClose,
    autoSelectFirstItem: false,
  });

  // Handle custom color selection
  const handleCustomColorSelect = (color: string) => {
    // Convert hex to rgba for a subtle background
    const hexToRgba = (hex: string, alpha: number = 0.1) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    applyBlockquoteColor({
      label: "Custom",
      value: color, // border color
      backgroundColor: hexToRgba(color, 0.1), // subtle background
      textColor: color, // text color matches border
    });
    onClose?.();
  };

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        {colors.map((color, index) => (
          <Button
            key={color.value}
            type="button"
            role="menuitem"
            data-active-state={activeColor === color.value ? "on" : "off"}
            aria-label={`${color.label} blockquote color`}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-style="ghost"
            onClick={() => {
              applyBlockquoteColor(color);
              onClose?.();
            }}
            data-highlighted={selectedIndex === index}
          >
            <span
              className="tiptap-button-highlight"
              style={
                { "--highlight-color": color.value } as React.CSSProperties
              }
            />
          </Button>
        ))}
      </div>

      <Separator />

      <div className="tiptap-button-group flex !flex-row justify-between !w-full">
        <Button
          onClick={() => {
            applyBlockquoteColor("reset");
            onClose?.();
          }}
          aria-label="Remove blockquote color"
          tabIndex={selectedIndex === colors.length ? 0 : -1}
          type="button"
          role="menuitem"
          data-style="ghost"
          data-highlighted={selectedIndex === colors.length}
        >
          <BanIcon className="tiptap-button-icon" />
        </Button>

        <Button
          onClick={() => setShowCustomColorInput(!showCustomColorInput)}
          aria-label="Custom color"
          type="button"
          role="menuitem"
          data-style="ghost"
        >
          <Plus className="tiptap-button-icon" />
        </Button>
      </div>

      {showCustomColorInput && (
        <>
          <Separator className="my-2" />
          <CustomColorInput onSelectColor={handleCustomColorSelect} />
        </>
      )}
    </div>
  );
}

// Custom Blockquote Color Icon
const BlockquoteColorIcon = ({ color }: { color: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
      <BlockQuoteIcon className="tiptap-button-icon" />
      {color && color !== "none" && (
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};

export const BlockquoteColorButton = React.forwardRef<
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
      aria-label="Blockquote color"
      tooltip="Blockquote color"
      ref={ref}
      {...props}
    >
      {children || <BlockquoteColorIcon color={activeColor || null} />}
    </Button>
  );
});

export interface BlockquoteColorPopoverProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  colors?: BlockquoteColor[];
  hideWhenUnavailable?: boolean;
}

export function BlockquoteColorPopover({
  editor: providedEditor,
  colors = DEFAULT_BLOCKQUOTE_COLORS,
  hideWhenUnavailable = false,
  ...props
}: BlockquoteColorPopoverProps) {
  const editor = useTiptapEditor(providedEditor);
  const { getActiveColor } = useBlockquoteColor(editor);
  const activeColor = getActiveColor();
  const [isOpen, setIsOpen] = React.useState(false);

  const isDisabled = React.useMemo(() => {
    if (!editor) return true;
    return !editor.can().toggleWrap("blockquote");
  }, [editor]);

  const isActive = editor?.isActive("blockquote") ?? false;

  const show = React.useMemo(() => {
    if (hideWhenUnavailable && (!editor || isDisabled)) {
      return false;
    }
    return true;
  }, [hideWhenUnavailable, editor, isDisabled]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor || isDisabled) return;

    // If blockquote is not active, toggle it on
    if (!isActive) {
      editor.chain().focus().toggleWrap("blockquote").run();
    } else {
      // If blockquote is active, open the color picker
      setIsOpen(true);
    }
  };

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <BlockquoteColorButton
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          aria-pressed={isActive}
          activeColor={activeColor}
          onClick={handleButtonClick}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Blockquote colors" className="w-auto">
        <BlockquoteColorContent
          editor={editor}
          colors={colors}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

BlockquoteColorButton.displayName = "BlockquoteColorButton";

export default BlockquoteColorPopover;
