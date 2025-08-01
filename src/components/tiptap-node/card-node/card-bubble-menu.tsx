import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import "./card-bubble-menu.scss";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../tiptap-ui-primitive/popover";
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import { Separator } from "../../tiptap-ui-primitive/separator";
import { BanIcon } from "../../tiptap-icons/ban-icon";
import { Plus, Palette, Brush, Square, CornerDownRight } from "lucide-react";

// Import the highlight popover styles to maintain consistency
import "@/components/tiptap-ui/highlight-popover/highlight-popover.scss";

interface CardBubbleMenuProps {
  editor: Editor;
}

interface CardColor {
  label: string;
  value: string;
  border?: string;
}

interface CardPreset {
  label: string;
  variant: "dark" | "gray-outline";
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface BorderRadiusOption {
  label: string;
  value: string;
}

const DEFAULT_CARD_COLORS: CardColor[] = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
];

const BORDER_RADIUS_OPTIONS: BorderRadiusOption[] = [
  { label: "None", value: "0px" },
  { label: "Small", value: "4px" },
  { label: "Medium", value: "8px" },
  { label: "Large", value: "12px" },
  { label: "Extra Large", value: "16px" },
  { label: "Full", value: "9999px" },
];

const CARD_PRESETS: CardPreset[] = [
  {
    label: "Dark",
    variant: "dark",
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    textColor: "#f9fafb",
  },
  {
    label: "Light",
    variant: "gray-outline",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    textColor: "#111827",
  },
];

type ColorType = "background" | "border" | "text";

// Custom Color Icon Components
const CardColorIcon = ({
  color,
  type,
}: {
  color: string | null;
  type: ColorType;
}) => {
  const IconComponent =
    type === "background" ? Palette : type === "border" ? Square : Brush;

  return (
    <div className="relative flex items-center justify-center">
      <IconComponent className="tiptap-button-icon" />
      {color && color !== "none" && (
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};

// Border Radius Icon Component
const BorderRadiusIcon = ({ radius }: { radius: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
      <CornerDownRight className="tiptap-button-icon" />
      {radius && (
        <div className=" mt-3 text-xs font-mono text-gray-500">
          {radius === "9999px" ? "∞" : radius}
        </div>
      )}
    </div>
  );
};

// Color Button Component (following TextColorButton pattern)
const CardColorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { activeColor?: string | null; colorType: ColorType }
>(({ className, children, activeColor, colorType, ...props }, ref) => {
  const getAriaLabel = () => {
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
      aria-label={getAriaLabel()}
      tooltip={getAriaLabel()}
      ref={ref}
      {...props}
    >
      {children || (
        <CardColorIcon color={activeColor || null} type={colorType} />
      )}
    </Button>
  );
});

// Border Radius Button Component
const BorderRadiusButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { activeRadius?: string | null }
>(({ className, children, activeRadius, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Card border radius"
      tooltip="Card border radius"
      ref={ref}
      {...props}
    >
      {children || <BorderRadiusIcon radius={activeRadius || null} />}
    </Button>
  );
});

// Custom Color Input Component (same as TextColorPopover)
function CustomCardColorInput({
  onSelectColor,
  colorType,
}: {
  onSelectColor: (color: string) => void;
  colorType: ColorType;
}) {
  const [customColor, setCustomColor] = React.useState("#000000");

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleApply = () => {
    onSelectColor(customColor);
  };

  const getColorLabel = () => {
    switch (colorType) {
      case "background":
        return "background";
      case "border":
        return "border";
      case "text":
        return "text";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="color"
        value={customColor}
        onChange={handleColorChange}
        className="w-8 h-8 rounded cursor-pointer border-0"
        aria-label={`Select custom ${getColorLabel()} color`}
      />
      <input
        type="text"
        value={customColor}
        onChange={handleColorChange}
        className="w-20 px-2 py-1 text-sm border rounded"
        aria-label={`Custom ${getColorLabel()} color hex value`}
      />
      <Button
        onClick={handleApply}
        type="button"
        data-style="solid"
        className="px-2 py-1 text-sm"
        aria-label={`Apply custom ${getColorLabel()} color`}
      >
        Apply
      </Button>
    </div>
  );
}

// Custom Border Radius Input Component
function CustomBorderRadiusInput({
  onSelectRadius,
  activeRadius,
}: {
  onSelectRadius: (radius: string) => void;
  activeRadius?: string | null;
}) {
  const [customRadius, setCustomRadius] = React.useState(activeRadius || "8px");

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRadius(e.target.value);
  };

  const handleApply = () => {
    onSelectRadius(customRadius);
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="text"
        value={customRadius}
        onChange={handleRadiusChange}
        placeholder="8px"
        className="w-20 px-2 py-1 text-sm border rounded"
        aria-label="Custom border radius value"
      />
      <Button
        onClick={handleApply}
        type="button"
        data-style="solid"
        className="px-2 py-1 text-sm"
        aria-label="Apply custom border radius"
      >
        Apply
      </Button>
    </div>
  );
}

// Color Content Component (following TextColorContent pattern)
function CardColorContent({
  editor,
  colors = DEFAULT_CARD_COLORS,
  colorType,
  onClose,
}: {
  editor?: Editor | null;
  colors?: CardColor[];
  colorType: ColorType;
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showCustomColorInput, setShowCustomColorInput] = React.useState(false);

  const handleColorSelect = (color: string) => {
    if (!editor) return;

    if (color === "none") {
      // Reset to default variant color
      switch (colorType) {
        case "background":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { backgroundColor: "" })
            .run();
          break;
        case "border":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { borderColor: "" })
            .run();
          break;
        case "text":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { textColor: "" })
            .run();
          break;
      }
    } else {
      // Set specific color
      switch (colorType) {
        case "background":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { backgroundColor: color })
            .run();
          break;
        case "border":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { borderColor: color })
            .run();
          break;
        case "text":
          editor
            .chain()
            .focus()
            .updateAttributes("cardNode", { textColor: color })
            .run();
          break;
      }
    }
    onClose?.();
  };

  // Handle custom color selection
  const handleCustomColorSelect = (color: string) => {
    handleColorSelect(color);
    setShowCustomColorInput(false);
  };

  const getCurrentColor = () => {
    if (!editor) return null;
    // Get the card node's color attribute based on type
    const cardAttrs = editor.getAttributes("cardNode");
    switch (colorType) {
      case "background":
        return cardAttrs.backgroundColor || null;
      case "border":
        return cardAttrs.borderColor || null;
      case "text":
        return cardAttrs.textColor || null;
      default:
        return null;
    }
  };

  const getColorLabel = () => {
    switch (colorType) {
      case "background":
        return "background";
      case "border":
        return "border";
      case "text":
        return "text";
      default:
        return "";
    }
  };

  const activeColor = getCurrentColor();

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      {/* Color Picker Section */}
      <div className="tiptap-button-group" data-orientation="horizontal">
        {colors.map((color) => (
          <Button
            key={color.value}
            type="button"
            role="menuitem"
            data-active-state={activeColor === color.value ? "on" : "off"}
            aria-label={`${color.label} ${getColorLabel()} color`}
            tabIndex={-1}
            data-style="ghost"
            onClick={() => handleColorSelect(color.value)}
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
          onClick={() => handleColorSelect("none")}
          aria-label={`Remove ${getColorLabel()} color`}
          tabIndex={-1}
          type="button"
          role="menuitem"
          data-style="ghost"
        >
          <BanIcon className="tiptap-button-icon" />
        </Button>

        <Button
          onClick={() => setShowCustomColorInput(!showCustomColorInput)}
          aria-label={`Custom ${getColorLabel()} color`}
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
          <CustomCardColorInput
            onSelectColor={handleCustomColorSelect}
            colorType={colorType}
          />
        </>
      )}
    </div>
  );
}

// Border Radius Content Component
function BorderRadiusContent({
  editor,
  onClose,
}: {
  editor?: Editor | null;
  radiusOptions?: BorderRadiusOption[];
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showCustomRadiusInput, setShowCustomRadiusInput] =
    React.useState(false);

  const handleRadiusSelect = (radius: string) => {
    if (!editor) return;

    if (radius === "none") {
      editor
        .chain()
        .focus()
        .updateAttributes("cardNode", { borderRadius: "" })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .updateAttributes("cardNode", { borderRadius: radius })
        .run();
    }
    onClose?.();
  };

  const handleCustomRadiusSelect = (radius: string) => {
    handleRadiusSelect(radius);
    setShowCustomRadiusInput(false);
  };

  const getCurrentRadius = () => {
    if (!editor) return null;
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.borderRadius || null;
  };

  const activeRadius = getCurrentRadius();

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <Separator className="my-2" />
      <CustomBorderRadiusInput
        activeRadius={activeRadius}
        onSelectRadius={handleCustomRadiusSelect}
      />
    </div>
  );
}

// Main Popover Component (following TextColorPopover pattern)
function CardColorPopover({
  editor,
  colors = DEFAULT_CARD_COLORS,
  colorType,
  ...props
}: {
  editor?: Editor | null;
  colors?: CardColor[];
  colorType: ColorType;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getCurrentColor = () => {
    if (!editor) return null;
    // Get the card node's color attribute based on type
    const cardAttrs = editor.getAttributes("cardNode");
    switch (colorType) {
      case "background":
        return cardAttrs.backgroundColor || null;
      case "border":
        return cardAttrs.borderColor || null;
      default:
        return null;
    }
  };

  const activeColor = getCurrentColor();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <CardColorButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          activeColor={activeColor}
          colorType={colorType}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent
        aria-label={`Card ${colorType} colors`}
        className="w-auto"
      >
        <CardColorContent
          editor={editor}
          colors={colors}
          colorType={colorType}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

// Border Radius Popover Component
function BorderRadiusPopover({
  editor,
  radiusOptions = BORDER_RADIUS_OPTIONS,
  ...props
}: {
  editor?: Editor | null;
  radiusOptions?: BorderRadiusOption[];
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getCurrentRadius = () => {
    if (!editor) return null;
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.borderRadius || null;
  };

  const activeRadius = getCurrentRadius();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <BorderRadiusButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          activeRadius={activeRadius}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Card border radius" className="w-auto">
        <BorderRadiusContent
          editor={editor}
          radiusOptions={radiusOptions}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

export const CardBubbleMenu: React.FC<CardBubbleMenuProps> = ({ editor }) => {
  if (!editor || !editor.isEditable) {
    return null;
  }

  const handlePresetSelect = (preset: CardPreset) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", {
        backgroundColor: preset.backgroundColor || "",
        borderColor: preset.borderColor || "",
        textColor: preset.textColor || "",
      })
      .run();
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="CardBubbleMenu"
      shouldShow={({ editor }) => {
        return editor.isActive("cardNode");
      }}
      tippyOptions={{
        placement: "top",
        animation: "fade",
      }}
      className="card-bubble-menu"
    >
      <div className="card-bubble-menu-content">
        <div className="flex gap-2">
          {CARD_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              role="menuitem"
              aria-label={`Apply ${preset.label} preset`}
              tabIndex={-1}
              data-style="ghost"
              onClick={() => handlePresetSelect(preset)}
              className="flex-1 text-sm"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <CardColorPopover editor={editor} colorType="background" />
        <CardColorPopover editor={editor} colorType="border" />
        <BorderRadiusPopover editor={editor} />
      </div>
    </BubbleMenu>
  );
};

CardColorButton.displayName = "CardColorButton";
BorderRadiusButton.displayName = "BorderRadiusButton";

export default CardBubbleMenu;
