import * as React from "react";
import { type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { CardIcon } from "@/components/tiptap-icons/card-icon";

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils";

// --- UI Primitives ---
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button";

export interface CardButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null;
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Whether the button should hide when the node is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

export function isCardNodeInSchema(editor: Editor | null): boolean {
  return isNodeInSchema("cardNode", editor);
}

export function isCardNodeActive(editor: Editor | null): boolean {
  if (!editor) return false;
  return editor.isActive("cardNode");
}

export function canInsertCard(editor: Editor | null): boolean {
  if (!editor) return false;

  try {
    return editor.can().insertContent({
      type: "cardNode",
      attrs: { variant: "dark" },
    });
  } catch {
    return false;
  }
}

export function insertCard(
  editor: Editor | null,
  variant: "dark" | "gray-outline" = "dark"
): boolean {
  if (!editor) return false;

  try {
    const { selection } = editor.state;
    const { from, to } = selection;

    // Check if there's selected text
    if (from !== to) {
      // Get the selected content
      const selectedContent = editor.state.doc.slice(from, to);

      // Insert card with the selected content
      return editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent({
          type: "cardNode",
          attrs: { variant },
          content: selectedContent.content.toJSON(),
        })
        .run();
    } else {
      // Insert empty card
      return editor.chain().focus().insertCard(variant).run();
    }
  } catch {
    return false;
  }
}

export function useCardState(
  editor: Editor | null,
  disabled: boolean = false,
  hideWhenUnavailable: boolean = false
) {
  const nodeInSchema = React.useMemo(
    () => (editor ? isCardNodeInSchema(editor) : false),
    [editor]
  );

  const canInsert = React.useMemo(
    () => (editor ? canInsertCard(editor) : false),
    [editor]
  );

  const isDisabled = React.useMemo(
    () => disabled || !editor || !canInsert,
    [disabled, editor, canInsert]
  );

  const isActive = React.useMemo(
    () => (editor ? isCardNodeActive(editor) : false),
    [editor]
  );

  const shouldShow = React.useMemo(() => {
    if (!nodeInSchema && hideWhenUnavailable) return false;
    return true;
  }, [nodeInSchema, hideWhenUnavailable]);

  const handleInsertCard = React.useCallback(
    (variant: "dark" | "gray-outline" = "dark") => {
      insertCard(editor, variant);
    },
    [editor]
  );

  return {
    nodeInSchema,
    canInsert,
    isDisabled,
    isActive,
    shouldShow,
    handleInsertCard,
    Icon: CardIcon,
    shortcutKey: "Ctrl-Shift-k",
    label: "Card",
  };
}

const CardButton = React.forwardRef<HTMLButtonElement, CardButtonProps>(
  (
    {
      editor: editorProp,
      text,
      disabled = false,
      hideWhenUnavailable = false,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor();
    const activeEditor = editorProp || editor;

    const {
      shouldShow,
      isDisabled,
      isActive,
      handleInsertCard,
      Icon,
      shortcutKey,
      label,
    } = useCardState(activeEditor, disabled, hideWhenUnavailable);

    if (!shouldShow) {
      return null;
    }

    const handleClick = () => {
      handleInsertCard("dark");
    };

    return (
      <Button
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        shortcutKeys={shortcutKey}
        disabled={isDisabled}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        <Icon className="tiptap-button-icon" />
        {text && <span className="tiptap-button-text">{text}</span>}
      </Button>
    );
  }
);

CardButton.displayName = "CardButton";

export default CardButton;
