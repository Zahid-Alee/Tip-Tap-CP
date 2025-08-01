import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { Bold } from "lucide-react";

// --- UI Primitives ---
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

export type FontWeight = "semibold" | "bold" | "extrabold";

export interface BoldDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  weights?: FontWeight[];
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const fontWeightConfig = {
  semibold: {
    label: "Semibold",
    value: "600",
    class: "font-semibold",
  },
  bold: {
    label: "Bold",
    value: "700",
    class: "font-bold",
  },
  extrabold: {
    label: "Extra Bold",
    value: "800",
    class: "font-extrabold",
  },
};

export function BoldDropdownMenu({
  editor: providedEditor,
  weights = ["semibold", "bold", "extrabold"],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: BoldDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const editor = useTiptapEditor(providedEditor);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const getActiveWeight = React.useCallback((): FontWeight | undefined => {
    if (!editor) return undefined;

    // Check if the textStyle mark is active and get its font weight
    const textStyleAttributes = editor.getAttributes("textStyle");
    const fontWeight = textStyleAttributes.fontWeight;

    if (fontWeight && fontWeight !== "normal" && fontWeight !== "400") {
      // Handle both numeric and named font weights
      if (fontWeight === "800" || fontWeight === "extrabold")
        return "extrabold";
      if (fontWeight === "700" || fontWeight === "bold") return "bold";
      if (fontWeight === "600" || fontWeight === "semibold") return "semibold";
    }

    return undefined;
  }, [editor]);

  const handleWeightClick = React.useCallback(
    (weight: FontWeight) => {
      if (!editor) return;

      const currentWeight = getActiveWeight();
      const config = fontWeightConfig[weight];

      // If clicking the same weight, set to normal (toggle off)
      if (currentWeight === weight) {
        editor.chain().focus().setFontWeight("normal").run();
      } else {
        // Apply the new weight using our Bold extension with textStyle
        editor.chain().focus().setFontWeight(config.value).run();
      }
    },
    [editor, getActiveWeight]
  );

  const canApplyWeight = React.useCallback((): boolean => {
    if (!editor) return false;

    // Check if we can apply the textStyle mark with fontWeight
    return editor.can().setMark("textStyle", { fontWeight: "600" });
  }, [editor]);

  const isDisabled = !canApplyWeight();
  const activeWeight = getActiveWeight();
  const isAnyWeightActive = activeWeight !== undefined;

  const show = React.useMemo(() => {
    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection)) {
        return false;
      }
    }
    return true;
  }, [hideWhenUnavailable, editor]);

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isAnyWeightActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Font weight"
          aria-pressed={isAnyWeightActive}
          tooltip="Font Weight"
          {...props}
        >
          <Bold className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {weights.map((weight) => {
            const config = fontWeightConfig[weight];
            const isActive = activeWeight === weight;

            return (
              <DropdownMenuItem key={weight} asChild>
                <Button
                  type="button"
                  data-style="ghost"
                  data-active-state={isActive ? "on" : "off"}
                  onClick={() => handleWeightClick(weight)}
                >
                  <span className="w-full text-left">{config.label}</span>
                </Button>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BoldDropdownMenu;
