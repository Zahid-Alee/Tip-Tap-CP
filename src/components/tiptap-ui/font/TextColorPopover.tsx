import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { Plus,Brush } from "lucide-react"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

// --- UI Primitives ---
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

// --- Styles ---
import "@/components/tiptap-ui/highlight-popover/highlight-popover.scss"

export interface TextColor {
  label: string
  value: string
  border?: string
}

export interface TextColorContentProps {
  editor?: Editor | null
  colors?: TextColor[]
  activeNode?: number
}

export const DEFAULT_TEXT_COLORS: TextColor[] = [
  {
    label: "Green",
    value: "#22c55e",
  },
  {
    label: "Blue",
    value: "#3b82f6",
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
    label: "Yellow",
    value: "#eab308",
  },
  {
    label: "Orange",
    value: "#f97316",
  },
  {
    label: "Gray",
    value: "#6b7280",
  },
]

export const useTextColor = (editor: Editor | null) => {
  const markAvailable = isMarkInSchema("textStyle", editor)

  const getActiveColor = React.useCallback(() => {
    if (!editor) return null
    if (!editor.isActive("textStyle", { color: /.*/ })) return null
    const attrs = editor.getAttributes("textStyle")
    return attrs.color || null
  }, [editor])

  const toggleTextColor = React.useCallback(
    (color: string) => {
      if (!markAvailable || !editor) return
      if (color === "none") {
        editor.chain().focus().unsetColor().run()
      } else {
        editor.chain().focus().setColor(color).run()
      }
    },
    [markAvailable, editor]
  )

  return {
    markAvailable,
    getActiveColor,
    toggleTextColor,
  }
}

// Custom Text Color Icon
const TextColorIcon = ({ color }: { color: string | null }) => {
  return (
    <div className="relative flex items-center justify-center">
     
     <Brush class='tiptap-button-icon' />
      {color && color !== "none" && (
        <div 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-sm" 
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}

export const TextColorButton = React.forwardRef<
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
      aria-label="Text color"
      tooltip="Text color"
      ref={ref}
      {...props}
    >
      {children || <TextColorIcon color={activeColor} />}
    </Button>
  )
})

// New component for custom color input
export function CustomColorInput({
  onSelectColor,
}: {
  onSelectColor: (color: string) => void
}) {
  const [customColor, setCustomColor] = React.useState("#000000")
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
  }
  
  const handleApply = () => {
    onSelectColor(customColor)
  }
  
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
  )
}

export function TextColorContent({
  editor: providedEditor,
  colors = DEFAULT_TEXT_COLORS,
  onClose,
}: {
  editor?: Editor | null
  colors?: TextColor[]
  onClose?: () => void
}) {
  const editor = useTiptapEditor(providedEditor)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { getActiveColor, toggleTextColor } = useTextColor(editor)
  const activeColor = getActiveColor()
  const [showCustomColorInput, setShowCustomColorInput] = React.useState(false)

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      toggleTextColor(item.value)
      onClose?.()
    },
    onClose,
    autoSelectFirstItem: false,
  })

  // Handle custom color selection
  const handleCustomColorSelect = (color: string) => {
    toggleTextColor(color)
    onClose?.()
  }

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        {colors.map((color, index) => (
          <Button
            key={color.value}
            type="button"
            role="menuitem"
            data-active-state={activeColor === color.value ? "on" : "off"}
            aria-label={`${color.label} text color`}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-style="ghost"
            onClick={() => toggleTextColor(color.value)}
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
          onClick={() => toggleTextColor("none")}
          aria-label="Remove text color"
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
  )
}

export interface TextColorPopoverProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * The text colors to display in the popover.
   */
  colors?: TextColor[]
  /**
   * Whether to hide the text color popover.
   */
  hideWhenUnavailable?: boolean
}

export function TextColorPopover({
  editor: providedEditor,
  colors = DEFAULT_TEXT_COLORS,
  hideWhenUnavailable = false,
  ...props
}: TextColorPopoverProps) {
  const editor = useTiptapEditor(providedEditor)
  const { markAvailable, getActiveColor } = useTextColor(editor)
  const activeColor = getActiveColor()
  const [isOpen, setIsOpen] = React.useState(false)

  const isDisabled = React.useMemo(() => {
    if (!markAvailable || !editor) {
      return true
    }

    return (
      editor.isActive("code") ||
      editor.isActive("codeBlock") ||
      editor.isActive("imageUpload")
    )
  }, [markAvailable, editor])

  const canSetMark = React.useMemo(() => {
    if (!editor || !markAvailable) return false

    try {
      return editor.can().setColor("#000000")
    } catch {
      return false
    }
  }, [editor, markAvailable])

  const isActive = editor?.isActive("textStyle", { color: /.*/ }) ?? false

  const show = React.useMemo(() => {
    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection) || !canSetMark) {
        return false
      }
    }

    return true
  }, [hideWhenUnavailable, editor, canSetMark])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorButton
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          aria-pressed={isActive}
          activeColor={activeColor}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Text colors" className="w-auto">
        <TextColorContent
          editor={editor}
          colors={colors}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

TextColorButton.displayName = "TextColorButton"

export default TextColorPopover