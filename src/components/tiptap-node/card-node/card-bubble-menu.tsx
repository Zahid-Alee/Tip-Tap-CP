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
import {
  Plus,
  Palette,
  Brush,
  Square,
  CornerDownRight,
  Trash,
  Image,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

// Import the highlight popover styles to maintain consistency
import "@/components/tiptap-ui/highlight-popover/highlight-popover.scss";

// Import the image upload utility
import { handleImageUpload } from "../../../lib/tiptap-utils";

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

// Background Image Icon Component
const BackgroundImageIcon = ({ hasImage }: { hasImage: boolean }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Image className="tiptap-button-icon" />
      {hasImage && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-500 rounded-sm" />
      )}
    </div>
  );
};

// Overlay Icon Component
const OverlayIcon = ({ hasOverlay }: { hasOverlay: boolean }) => {
  return (
    <div className="relative flex items-center justify-center">
      <Layers className="tiptap-button-icon" />
      {hasOverlay && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-purple-500 rounded-sm" />
      )}
    </div>
  );
};

// Text Alignment Icon Component
const TextAlignmentIcon = ({ alignment }: { alignment: string | null }) => {
  const getIcon = () => {
    switch (alignment) {
      case "center":
        return AlignCenter;
      case "right":
        return AlignRight;
      case "justify":
        return AlignJustify;
      default:
        return AlignLeft;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="relative flex items-center justify-center">
      <IconComponent className="tiptap-button-icon" />
    </div>
  );
};

// Vertical Alignment Icon Component
const VerticalAlignmentIcon = ({ alignment }: { alignment: string | null }) => {
  const getIcon = () => {
    switch (alignment) {
      case "center":
        return AlignCenterVertical;
      case "bottom":
        return AlignEndVertical;
      default:
        return AlignStartVertical;
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="relative flex items-center justify-center">
      <IconComponent className="tiptap-button-icon" />
    </div>
  );
};

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

// Background Image Button Component
const BackgroundImageButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { hasImage?: boolean }
>(({ className, children, hasImage, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Card background image"
      tooltip="Card background image"
      ref={ref}
      {...props}
    >
      {children || <BackgroundImageIcon hasImage={hasImage || false} />}
    </Button>
  );
});

// Overlay Button Component
const OverlayButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { hasOverlay?: boolean }
>(({ className, children, hasOverlay, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Card overlay"
      tooltip="Card overlay"
      ref={ref}
      {...props}
    >
      {children || <OverlayIcon hasOverlay={hasOverlay || false} />}
    </Button>
  );
});

// Text Alignment Button Component
const TextAlignmentButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { alignment?: string | null }
>(({ className, children, alignment, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Text alignment"
      tooltip="Text alignment"
      ref={ref}
      {...props}
    >
      {children || <TextAlignmentIcon alignment={alignment || null} />}
    </Button>
  );
});

// Vertical Alignment Button Component
const VerticalAlignmentButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { alignment?: string | null }
>(({ className, children, alignment, ...props }, ref) => {
  return (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Vertical alignment"
      tooltip="Vertical alignment"
      ref={ref}
      {...props}
    >
      {children || <VerticalAlignmentIcon alignment={alignment || null} />}
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
        className="px-2 py-1  text-sm"
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

// Background Image Content Component
function BackgroundImageContent({
  editor,
  onClose,
}: {
  editor?: Editor | null;
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  const getCurrentBackgroundImage = () => {
    if (!editor) return null;
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.backgroundImage || null;
  };

  const handleImageUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Use your existing server upload function
      const uploadedUrl = await handleImageUpload(file);

      if (uploadedUrl) {
        editor
          ?.chain()
          .focus()
          .updateAttributes("cardNode", { backgroundImage: uploadedUrl })
          .run();
        onClose?.();
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim() || !editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", { backgroundImage: imageUrl.trim() })
      .run();
    onClose?.();
  };

  const handleRemoveImage = () => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", {
        backgroundImage: "",
        overlayColor: "",
        overlayOpacity: 0.5,
      })
      .run();
    onClose?.();
  };

  const currentImage = getCurrentBackgroundImage();

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="flex flex-col gap-1 p-1 bg-white border border-gray-200 rounded-md shadow-sm">
        {/* Action Row */}
        <div className="flex gap-1  justify-between items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            type="button"
            data-style="ghost"
            aria-label="Upload image"
            className="flex items-center  justify-center bg-gray-100 hover:bg-gray-200 rounded px-2 text-xs h-7 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "📤 Uploading..." : "📁 Upload"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUploadFile}
            className="hidden"
            disabled={isUploading}
          />

          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste URL..."
            disabled={isUploading}
            className="flex-1 h-7 px-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Image URL"
          />

          <button
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim() || isUploading}
            type="button"
            data-style="ghost"
            className="bg-blue-500  text-white hover:bg-blue-600 rounded px-2 text-xs h-7 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Apply
          </button>

          {currentImage && (
            <button
              onClick={handleRemoveImage}
              disabled={isUploading}
              type="button"
              data-style="ghost"
              className="bg-red-100 rounded-[50%] h-6 min-w-6  flex-grow-0     text-xs text-red-500 hover:bg-red-200 cursor-pointer"
              aria-label="Remove image"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Overlay Content Component
function OverlayContent({
  editor,
  onClose,
}: {
  editor?: Editor | null;
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [overlayColor, setOverlayColor] = React.useState("#000000");
  const [overlayOpacity, setOverlayOpacity] = React.useState(0.5);

  React.useEffect(() => {
    if (editor) {
      const cardAttrs = editor.getAttributes("cardNode");
      if (cardAttrs.overlayColor) setOverlayColor(cardAttrs.overlayColor);
      if (cardAttrs.overlayOpacity) setOverlayOpacity(cardAttrs.overlayOpacity);
    }
  }, [editor]);

  const handleApplyOverlay = () => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", {
        overlayColor,
        overlayOpacity,
      })
      .run();
    onClose?.();
  };

  const handleRemoveOverlay = () => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", {
        overlayColor: "",
        overlayOpacity: 0.5,
      })
      .run();
    onClose?.();
  };

  const getCurrentOverlay = () => {
    if (!editor) return { color: null, opacity: null };
    const cardAttrs = editor.getAttributes("cardNode");
    return {
      color: cardAttrs.overlayColor || null,
      opacity: cardAttrs.overlayOpacity || null,
    };
  };

  const currentOverlay = getCurrentOverlay();

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="flex flex-col gap-1.5 p-2">
        {/* Compact controls row */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={overlayColor}
            onChange={(e) => setOverlayColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 flex-shrink-0"
            aria-label="Overlay color"
          />

          <div className="flex-1 flex items-center gap-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="flex-1 h-1"
              aria-label="Overlay opacity"
            />
            <span className="text-xs text-gray-500 min-w-[30px]">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 items-center">
          <button
            onClick={handleApplyOverlay}
            type="button"
            data-style="solid"
            className="flex-1 bg-gray-200 rounded-md h-7 px-2 text-xs"
            aria-label="Apply overlay"
          >
            Apply
          </button>

          {currentOverlay.color && (
            <button
              onClick={handleRemoveOverlay}
              type="button"
              data-style="ghost"
              className="h-6 bg-red-100 rounded-[50%]   max-w-6  text-xs text-red-500 hover:bg-red-200 cursor-pointer"
              aria-label="Remove overlay"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Text Alignment Content Component
function TextAlignmentContent({
  editor,
  onClose,
}: {
  editor?: Editor | null;
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleAlignmentSelect = (
    alignment: "left" | "center" | "right" | "justify"
  ) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", { textAlignment: alignment })
      .run();
    onClose?.();
  };

  const getCurrentAlignment = () => {
    if (!editor) return "left";
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.textAlignment || "left";
  };

  const activeAlignment = getCurrentAlignment();

  const alignmentOptions = [
    { value: "left", icon: AlignLeft, label: "Left" },
    { value: "center", icon: AlignCenter, label: "Center" },
    { value: "right", icon: AlignRight, label: "Right" },
    { value: "justify", icon: AlignJustify, label: "Justify" },
  ];

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        {alignmentOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.value}
              type="button"
              role="menuitem"
              data-active-state={
                activeAlignment === option.value ? "on" : "off"
              }
              aria-label={`${option.label} align text`}
              tabIndex={-1}
              data-style="ghost"
              onClick={() => handleAlignmentSelect(option.value as any)}
              className="flex items-center justify-center w-8 h-8"
            >
              <IconComponent className="tiptap-button-icon" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// Vertical Alignment Content Component
function VerticalAlignmentContent({
  editor,
  onClose,
}: {
  editor?: Editor | null;
  onClose?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleVerticalAlignmentSelect = (
    alignment: "top" | "center" | "bottom"
  ) => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .updateAttributes("cardNode", { verticalAlignment: alignment })
      .run();
    onClose?.();
  };

  const getCurrentVerticalAlignment = () => {
    if (!editor) return "top";
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.verticalAlignment || "top";
  };

  const activeVerticalAlignment = getCurrentVerticalAlignment();

  const verticalAlignmentOptions = [
    { value: "top", icon: AlignStartVertical, label: "Top" },
    { value: "center", icon: AlignCenterVertical, label: "Center" },
    { value: "bottom", icon: AlignEndVertical, label: "Bottom" },
  ];

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        {verticalAlignmentOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.value}
              type="button"
              role="menuitem"
              data-active-state={
                activeVerticalAlignment === option.value ? "on" : "off"
              }
              aria-label={`${option.label} vertical align`}
              tabIndex={-1}
              data-style="ghost"
              onClick={() => handleVerticalAlignmentSelect(option.value as any)}
              className="flex items-center justify-center w-8 h-8"
            >
              <IconComponent className="tiptap-button-icon" />
            </Button>
          );
        })}
      </div>
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

// Background Image Popover Component
function BackgroundImagePopover({
  editor,
  ...props
}: {
  editor?: Editor | null;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hasBackgroundImage = () => {
    if (!editor) return false;
    const cardAttrs = editor.getAttributes("cardNode");
    return !!cardAttrs.backgroundImage;
  };

  const hasImage = hasBackgroundImage();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <BackgroundImageButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          hasImage={hasImage}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Card background image" className="w-auto">
        <BackgroundImageContent
          editor={editor}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

// Overlay Popover Component
function OverlayPopover({
  editor,
  ...props
}: {
  editor?: Editor | null;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hasOverlay = () => {
    if (!editor) return false;
    const cardAttrs = editor.getAttributes("cardNode");
    return !!cardAttrs.overlayColor;
  };

  const hasActiveOverlay = hasOverlay();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <OverlayButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          hasOverlay={hasActiveOverlay}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Card overlay" className="w-auto">
        <OverlayContent editor={editor} onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

// Text Alignment Popover Component
function TextAlignmentPopover({
  editor,
  ...props
}: {
  editor?: Editor | null;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getCurrentAlignment = () => {
    if (!editor) return "left";
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.textAlignment || "left";
  };

  const currentAlignment = getCurrentAlignment();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextAlignmentButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          alignment={currentAlignment}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Text alignment" className="w-auto">
        <TextAlignmentContent
          editor={editor}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

// Vertical Alignment Popover Component
function VerticalAlignmentPopover({
  editor,
  ...props
}: {
  editor?: Editor | null;
} & ButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const getCurrentVerticalAlignment = () => {
    if (!editor) return "top";
    const cardAttrs = editor.getAttributes("cardNode");
    return cardAttrs.verticalAlignment || "top";
  };

  const currentVerticalAlignment = getCurrentVerticalAlignment();
  const isActive = editor?.isActive("cardNode") ?? false;

  if (!editor || !editor.isEditable) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <VerticalAlignmentButton
          data-active-state={isActive ? "on" : "off"}
          aria-pressed={isActive}
          alignment={currentVerticalAlignment}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Vertical alignment" className="w-auto">
        <VerticalAlignmentContent
          editor={editor}
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

  const handleDelete = () => {
    if (!editor || !editor.isEditable) return;

    // Find the current card node position and delete it
    const { selection } = editor.state;
    const { $from } = selection;

    // Find the card node that contains the current selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === "cardNode") {
        const pos = $from.before(depth);
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .run();
        return;
      }
    }
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
      className="card-bubble-menu w-[410px]"
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
        <BackgroundImagePopover editor={editor} />
        <OverlayPopover editor={editor} />
        <TextAlignmentPopover editor={editor} />
        <VerticalAlignmentPopover editor={editor} />
        <Button
          type="button"
          role="menuitem"
          tabIndex={-1}
          data-style="ghost"
          className="flex-1 text-sm text-red-500"
          onClick={handleDelete}
          aria-label="Delete card"
        >
          <Trash size={14} color="red" />
        </Button>
      </div>
    </BubbleMenu>
  );
};

CardColorButton.displayName = "CardColorButton";
BorderRadiusButton.displayName = "BorderRadiusButton";
BackgroundImageButton.displayName = "BackgroundImageButton";
OverlayButton.displayName = "OverlayButton";
TextAlignmentButton.displayName = "TextAlignmentButton";
VerticalAlignmentButton.displayName = "VerticalAlignmentButton";

export default CardBubbleMenu;
