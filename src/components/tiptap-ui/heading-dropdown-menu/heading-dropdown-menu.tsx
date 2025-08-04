import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { HeadingIcon } from "@/components/tiptap-icons/heading-icon";

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils";

// --- Tiptap UI ---
import {
  HeadingButton,
  headingIcons,
  type Level,
  getFormattedHeadingName,
} from "@/components/tiptap-ui/heading-button/heading-button";

// --- UI Primitives ---
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  levels?: Level[];
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showCustomFontSize?: boolean;
}

export function HeadingDropdownMenu({
  editor: providedEditor,
  levels = [1, 2, 3, 4, 5, 6],
  hideWhenUnavailable = false,
  onOpenChange,
  showCustomFontSize = true,
  ...props
}: HeadingDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customFontSize, setCustomFontSize] = React.useState("");
  const editor = useTiptapEditor(providedEditor);

  const headingInSchema = isNodeInSchema("heading", editor);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const getActiveIcon = React.useCallback(() => {
    if (!editor) return <HeadingIcon className="tiptap-button-icon" />;

    const activeLevel = levels.find((level) =>
      editor.isActive("heading", { level })
    ) as Level | undefined;

    if (!activeLevel) return <HeadingIcon className="tiptap-button-icon" />;

    const ActiveIcon = headingIcons[activeLevel];
    return <ActiveIcon className="tiptap-button-icon" />;
  }, [editor, levels]);

  const canToggleAnyHeading = React.useCallback((): boolean => {
    if (!editor) return false;
    return levels.some((level) =>
      editor.can().toggleNode("heading", "paragraph", { level })
    );
  }, [editor, levels]);

  const isDisabled = !canToggleAnyHeading();
  const isAnyHeadingActive = editor?.isActive("heading") ?? false;

  // ...existing code...
  // ...existing code...
  const handleCustomFontSizeSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!editor) return;

      const fontSize = parseInt(customFontSize);
      if (isNaN(fontSize) || fontSize <= 0) return;

      // Get current selection
      const { from, to } = editor.state.selection;

      // Apply font size using TextStyle extension
      if (from !== to) {
        // Text is selected
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setFontSize(`${fontSize}px`)
          .run();
      } else {
        // No selection - apply for future typing
        editor.chain().focus().setFontSize(`${fontSize}px`).run();
      }

      setCustomFontSize("");
      setIsOpen(false);
    },
    [editor, customFontSize]
  );
  // ...existing code...
  // ...existing code...

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Only allow numbers
      if (value === "" || /^\d+$/.test(value)) {
        setCustomFontSize(value);
      }
    },
    []
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCustomFontSizeSubmit(e as any);
      }
    },
    [handleCustomFontSizeSubmit]
  );

  const show = React.useMemo(() => {
    if (!headingInSchema) {
      return false;
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor?.state.selection)) {
        return false;
      }
    }

    return true;
  }, [headingInSchema, hideWhenUnavailable, editor]);

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
          data-active-state={isAnyHeadingActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Format text as heading"
          aria-pressed={isAnyHeadingActive}
          tooltip="Heading"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {levels.map((level) => (
            <DropdownMenuItem key={`heading-${level}`} asChild>
              <HeadingButton
                editor={editor}
                level={level}
                text={getFormattedHeadingName(level)}
                tooltip={""}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <div className="px-2 mt-2">
            <div className="flex  flex-col">
              <label
                htmlFor="custom-font-size"
                className="text-sm font-medium whitespace-nowrap"
              >
                Font Size:
              </label>
              <div
                onKeyDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex px-2 mt-1 items-center gap-1"
              >
                <input
                  id="custom-font-size"
                  type="number"
                  value={customFontSize}
                  defaultValue={customFontSize}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="16"
                  className="w-14 px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={3}
                />
                <span className="text-sm text-gray-500">px</span>
                <Button
                  onClick={handleCustomFontSizeSubmit}
                  size="sm"
                  className="px-2 ml-1 py-1 text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </DropdownMenuGroup>

        {/* {showCustomFontSize && (
       
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HeadingDropdownMenu;
