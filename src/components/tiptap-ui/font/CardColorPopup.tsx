import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useMenuNavigation } from "../../../hooks/use-menu-navigation";
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { BanIcon } from "../../tiptap-icons/ban-icon";
import { Plus, Palette, Square } from "lucide-react";

// --- UI Primitives ---
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../tiptap-ui-primitive/popover";
import { Separator } from "../../tiptap-ui-primitive/separator";

// --- Styles ---
import "../../tiptap-ui/highlight-popover/highlight-popover.scss";

export interface CardColor {
  label: string;
  value: string;
  border?: string;
}

export interface CardColorContentProps {
  editor?: Editor | null;
  backgroundColors?: CardColor[];
  borderColors?: CardColor[];
  textColors?: CardColor[];
  colorType?: "background" | "border" | "text";
}

export const DEFAULT_CARD_BACKGROUND_COLORS: CardColor[] = [
  {
    label: "Transparent",
    value: "transparent",
  },
  {
    label: "White",
    value: "#ffffff",
  },
  {
    label: "Light Gray",
    value: "#f8fafc",
  },
  {
    label: "Gray",
    value: "#f1f5f9",
  },
  {
    label: "Blue",
    value: "#dbeafe",
  },
  {
    label: "Green",
    value: "#dcfce7",
  },
  {
    label: "Yellow",
    value: "#fefce8",
  },
  {
    label: "Red",
    value: "#fef2f2",
  },
  {
    label: "Purple",
    value: "#faf5ff",
  },
  {
    label: "Dark",
    value: "#1a1a1a",
  },
];

export const DEFAULT_CARD_BORDER_COLORS: CardColor[] = [
  {
    label: "None",
    value: "transparent",
  },
  {
    label: "Gray",
    value: "#d1d5db",
  },
  {
    label: "Dark Gray",
    value: "#6b7280",
  },
  {
    label: "Blue",
    value: "#3b82f6",
  },
  {
    label: "Green",
    value: "#22c55e",
  },
  {
    label: "Yellow",
    value: "#eab308",
  },
  {
    label: "Red",
    value: "#ef4444",
  },
  {
    label: "Purple",
    value: "#a855f7",
  },
  {
    label: "Black",
    value: "#000000",
  },
];

export const DEFAULT_CARD_TEXT_COLORS: CardColor[] = [
  {
    label: "Inherit",
    value: "inherit",
  },
  {
    label: "Black",
    value: "#000000",
  },
  {
    label: "White",
    value: "#ffffff",
  },
  {
    label: "Gray",
    value: "#6b7280",
  },
  {
    label: "Blue",
    value: "#3b82f6",
  },
  {
    label: "Green",
    value: "#22c55e",
  },
  {
    label: "Yellow",
    value: "#eab308",
  },
  {
    label: "Red",
    value: "#ef4444",
  },
  {
    label: "Purple",
    value: "#a855f7",
  },
];

export const useCardColor = (editor: Editor | null) => {
  const cardNodeAvailable = React.useMemo(() => {
    if (!editor) return false;
    return editor.isActive("cardNode");
  }, [editor]);

  const getActiveCardColors = React.useCallback(() => {
    if (!editor || !editor.isActive("cardNode"))
      return {
        backgroundColor: null,
        borderColor: null,
        textColor: null,
      };
    const attrs = editor.getAttributes("cardNode");
    return {
      backgroundColor: attrs.backgroundColor || null,
      borderColor: attrs.borderColor || null,
      textColor: attrs.textColor || null,
    };
  }, [editor]);

  const updateCardColor = React.useCallback(
    (colorType: "background" | "border" | "text", color: string) => {
      if (!editor || !editor.isActive("cardNode")) {
        return;
      }

      const attributeMap = {
        background: "backgroundColor",
        border: "borderColor",
        text: "textColor",
      };

      const attribute = attributeMap[colorType];

      if (color === "none" || color === "transparent") {
        editor
          .chain()
          .focus()
          .updateAttributes("cardNode", { [attribute]: "transparent" })
          .run();
      } else if (color === "inherit" && colorType === "text") {
        editor
          .chain()
          .focus()
          .updateAttributes("cardNode", { [attribute]: "inherit" })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .updateAttributes("cardNode", { [attribute]: color })
          .run();
      }
    },
    [editor]
  );

  return {
    cardNodeAvailable,
    getActiveCardColors,
    updateCardColor,
  };
};

// Card Color Icon Components
const CardBackgroundIcon = ({ color }: { color: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Square
        className="tiptap-button-icon"
        fill={color || "transparent"}
        stroke={color === "transparent" ? "#d1d5db" : color || "#d1d5db"}
      />
    </div>
  );
};

const CardBorderIcon = ({ color }: { color: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Square
        className="tiptap-button-icon"
        fill="transparent"
        stroke={color === "transparent" ? "#d1d5db" : color || "#d1d5db"}
        strokeWidth={2}
      />
    </div>
  );
};

const CardTextIcon = ({ color }: { color: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Palette className="tiptap-button-icon" />
      {color && color !== "inherit" && (
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};

export const CardColorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    activeColor?: string | null;
    colorType?: "background" | "border" | "text";
  }
>(
  (
    { className, children, activeColor, colorType = "background", ...props },
    ref
  ) => {
    const getIcon = () => {
      switch (colorType) {
        case "background":
          return <CardBackgroundIcon color={activeColor || null} />;
        case "border":
          return <CardBorderIcon color={activeColor || null} />;
        case "text":
          return <CardTextIcon color={activeColor || null} />;
        default:
          return <CardBackgroundIcon color={activeColor || null} />;
      }
    };

    const getLabel = () => {
      switch (colorType) {
        case "background":
          return "Card background color";
        case "border":
          return "Card border color";
        case "text":
          return "Card text color";
        default:
          return "Card color";
      }
    };

    return (
      <Button
        type="button"
        className={className}
        data-style="ghost"
        data-appearance="default"
        role="button"
        tabIndex={-1}
        aria-label={getLabel()}
        tooltip={getLabel()}
        ref={ref}
        {...props}
      >
        {children || getIcon()}
      </Button>
    );
  }
);

// Custom Color Input component (reused from text color)
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

export function CardColorContent({
  editor: providedEditor,
  backgroundColors = DEFAULT_CARD_BACKGROUND_COLORS,
  borderColors = DEFAULT_CARD_BORDER_COLORS,
  textColors = DEFAULT_CARD_TEXT_COLORS,
  colorType = "background",
  onClose,
}: {
  editor?: Editor | null;
  backgroundColors?: CardColor[];
  borderColors?: CardColor[];
  textColors?: CardColor[];
  colorType?: "background" | "border" | "text";
  onClose?: () => void;
}) {
  const editor = useTiptapEditor(providedEditor);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { getActiveCardColors, updateCardColor } = useCardColor(editor);
  const activeColors = getActiveCardColors();
  const [showCustomColorInput, setShowCustomColorInput] = React.useState(false);

  const colors = React.useMemo(() => {
    switch (colorType) {
      case "background":
        return backgroundColors;
      case "border":
        return borderColors;
      case "text":
        return textColors;
      default:
        return backgroundColors;
    }
  }, [colorType, backgroundColors, borderColors, textColors]);

  const activeColor = React.useMemo(() => {
    switch (colorType) {
      case "background":
        return activeColors.backgroundColor;
      case "border":
        return activeColors.borderColor;
      case "text":
        return activeColors.textColor;
      default:
        return activeColors.backgroundColor;
    }
  }, [colorType, activeColors]);

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  );

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      updateCardColor(colorType, item.value);
      onClose?.();
    },
    onClose,
    autoSelectFirstItem: false,
  });

  // Handle custom color selection
  const handleCustomColorSelect = (color: string) => {
    updateCardColor(colorType, color);
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
            aria-label={`${color.label} card color`}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-style="ghost"
            onClick={() => updateCardColor(colorType, color.value)}
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
          onClick={() => updateCardColor(colorType, "none")}
          aria-label="Remove card color"
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

export interface CardColorPopoverProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null;
  /**
   * The card colors to display in the popover.
   */
  backgroundColors?: CardColor[];
  borderColors?: CardColor[];
  textColors?: CardColor[];
  /**
   * The type of color picker to show.
   */
  colorType?: "background" | "border" | "text";
  /**
   * Whether to hide the card color popover.
   */
  hideWhenUnavailable?: boolean;
}

export function CardColorPopover({
  editor: providedEditor,
  backgroundColors = DEFAULT_CARD_BACKGROUND_COLORS,
  borderColors = DEFAULT_CARD_BORDER_COLORS,
  textColors = DEFAULT_CARD_TEXT_COLORS,
  colorType = "background",
  hideWhenUnavailable = false,
  ...props
}: CardColorPopoverProps) {
  const editor = useTiptapEditor(providedEditor);
  const { cardNodeAvailable, getActiveCardColors } = useCardColor(editor);
  const activeColors = getActiveCardColors();
  const [isOpen, setIsOpen] = React.useState(false);

  const activeColor = React.useMemo(() => {
    switch (colorType) {
      case "background":
        return activeColors.backgroundColor;
      case "border":
        return activeColors.borderColor;
      case "text":
        return activeColors.textColor;
      default:
        return activeColors.backgroundColor;
    }
  }, [colorType, activeColors]);

  const isDisabled = React.useMemo(() => {
    if (!cardNodeAvailable || !editor) {
      return true;
    }

    return !editor.isActive("cardNode");
  }, [cardNodeAvailable, editor]);

  const isActive = editor?.isActive("cardNode") ?? false;

  const show = React.useMemo(() => {
    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection) || !cardNodeAvailable) {
        return false;
      }
    }

    return true;
  }, [hideWhenUnavailable, editor, cardNodeAvailable]);

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <CardColorButton
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          aria-pressed={isActive}
          activeColor={activeColor}
          colorType={colorType}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Card colors" className="w-auto">
        <CardColorContent
          editor={editor}
          backgroundColors={backgroundColors}
          borderColors={borderColors}
          textColors={textColors}
          colorType={colorType}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

CardColorButton.displayName = "CardColorButton";

export default CardColorPopover;
