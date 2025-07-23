import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon";
import { Settings } from "lucide-react";

// --- UI Primitives ---
import { Button, ButtonProps } from "../../tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "../../tiptap-ui-primitive/dropdown-menu";
import { TextSettingIcon } from "../../tiptap-icons/text-setting-icon";

export interface TextSettingsDropdownMenuProps
  extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function TextSettingsDropdownMenu({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: TextSettingsDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [lineHeight, setLineHeight] = React.useState("1.5");
  const [letterSpacing, setLetterSpacing] = React.useState("0");
  const [wordSpacing, setWordSpacing] = React.useState("0");
  const editor = useTiptapEditor(providedEditor);

  // Handle open/close state
  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  // Get current values from editor
  React.useEffect(() => {
    if (!editor) return;

    const nodeTypes = ["paragraph", "heading"];

    for (const nodeType of nodeTypes) {
      const attrs = editor.getAttributes(nodeType);

      if (attrs.lineHeight) {
        setLineHeight(String(attrs.lineHeight));
      }

      if (attrs.letterSpacing) {
        // Convert from em back to px for display (1em = 16px)
        const emValue = parseFloat(attrs.letterSpacing.replace("em", "")) || 0;
        const pxValue = Math.round(emValue * 16);
        setLetterSpacing(String(pxValue));
      }

      if (attrs.wordSpacing) {
        // Convert from em back to px for display (1em = 16px)
        const emValue = parseFloat(attrs.wordSpacing.replace("em", "")) || 0;
        const pxValue = Math.round(emValue * 16);
        setWordSpacing(String(pxValue));
      }

      break; // Use the first matching node type
    }
  }, [editor]);

  // Apply line height changes with debounce
  React.useEffect(() => {
    if (!editor || !lineHeight) return;

    const timeoutId = setTimeout(() => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // Apply to selection only
        (editor.chain() as any).setLineHeight(String(lineHeight)).run();
      } else {
        // Apply to entire document
        const { doc } = editor.state;
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (!dispatch) return false;

            // Apply to all nodes in the document
            doc.descendants((node, pos) => {
              if (
                node.type.name === "paragraph" ||
                node.type.name === "heading"
              ) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: String(lineHeight),
                });
              }
            });

            return true;
          })
          .run();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [editor, lineHeight]);

  // Apply letter spacing changes with debounce
  React.useEffect(() => {
    if (!editor) return;

    const timeoutId = setTimeout(() => {
      const numValue = parseFloat(String(letterSpacing)) || 0;
      const emValue = numValue / 16;
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // Apply to selection only
        (editor.chain() as any).setLetterSpacing(`${emValue}em`).run();
      } else {
        // Apply to entire document
        const { doc } = editor.state;
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (!dispatch) return false;

            // Apply to all nodes in the document
            doc.descendants((node, pos) => {
              if (
                node.type.name === "paragraph" ||
                node.type.name === "heading"
              ) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  letterSpacing: `${emValue}em`,
                });
              }
            });

            return true;
          })
          .run();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [editor, letterSpacing]);

  // Apply word spacing changes with debounce
  React.useEffect(() => {
    if (!editor) return;

    const timeoutId = setTimeout(() => {
      const numValue = parseFloat(String(wordSpacing)) || 0;
      const emValue = numValue / 16;
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // Apply to selection only
        (editor.chain() as any).setWordSpacing(`${emValue}em`).run();
      } else {
        // Apply to entire document
        const { doc } = editor.state;
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (!dispatch) return false;

            // Apply to all nodes in the document
            doc.descendants((node, pos) => {
              if (
                node.type.name === "paragraph" ||
                node.type.name === "heading"
              ) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  wordSpacing: `${emValue}em`,
                });
              }
            });

            return true;
          })
          .run();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [editor, wordSpacing]);

  const handleLineHeightChange = React.useCallback((value: string) => {
    setLineHeight(value);
  }, []);

  const handleLetterSpacingChange = React.useCallback((value: string) => {
    setLetterSpacing(value);
  }, []);

  const handleWordSpacingChange = React.useCallback((value: string) => {
    setWordSpacing(value);
  }, []);

  const canApplySettings = React.useCallback((): boolean => {
    if (!editor) return false;
    return true; // Always allow if editor is available
  }, [editor]);

  const isDisabled = !canApplySettings();

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
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Text settings"
          tooltip="Text Settings"
          {...props}
        >
          <TextSettingIcon className="tiptap-button-icon" />

          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <div
            className="space-y-4 py-3"
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Line Height */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Line Height
              </label>
              <input
                type="number"
                value={lineHeight}
                onChange={(e) => handleLineHeightChange(e.target.value)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
                min="0.5"
                max="5"
                placeholder="1.5"
              />
            </div>

            {/* Letter Spacing */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Letter Spacing
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={letterSpacing}
                  onChange={(e) => handleLetterSpacingChange(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="-10"
                  max="50"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>

            {/* Word Spacing */}
            <div className="flex gap-4 items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Word Spacing
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={wordSpacing}
                  onChange={(e) => handleWordSpacingChange(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="-10"
                  max="50"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  // Reset local state
                  handleLineHeightChange("1.5");
                  handleLetterSpacingChange("0");
                  handleWordSpacingChange("0");

                  // Actually reset the attributes in the editor
                  if (editor) {
                    const { from, to } = editor.state.selection;
                    const hasSelection = from !== to;

                    if (hasSelection) {
                      // Reset selection only
                      (editor.chain() as any)
                        .setLineHeight("1.5")
                        .setLetterSpacing("0em")
                        .setWordSpacing("0em")
                        .run();
                    } else {
                      // Reset entire document
                      const { doc } = editor.state;
                      editor
                        .chain()
                        .focus()
                        .command(({ tr, dispatch }) => {
                          if (!dispatch) return false;

                          // Reset all nodes in the document
                          doc.descendants((node, pos) => {
                            if (
                              node.type.name === "paragraph" ||
                              node.type.name === "heading"
                            ) {
                              tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                lineHeight: "1.5",
                                letterSpacing: "0em",
                                wordSpacing: "0em",
                              });
                            }
                          });

                          return true;
                        })
                        .run();
                    }
                  }
                }}
                className="w-full text-sm"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TextSettingsDropdownMenu;
