"use client";

import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { ListIcon } from "@/components/tiptap-icons/list-icon";
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon";
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon";

// --- UI Primitives ---
import { Button, ButtonProps } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

// Extended list types
export type ListType =
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "alphabetList"
  | "romanList"
  | "upperAlphabetList"
  | "lowerRomanList"
  | "upperRomanList";

export interface ListOption {
  label: string;
  type: ListType;
  icon: React.ElementType;
  style: string;
  category: "basic" | "numbered" | "symbols" | "special";
  cssListStyleType: string;
  customMarker?: string;
}

// Custom icons for new list types (you can replace these with your actual icons)
const AlphabetIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">
      a.
    </text>
  </svg>
);

const RomanIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor">
      i.
    </text>
  </svg>
);

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M5 12h14M12 5l7 7-7 7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      strokeWidth="2"
    />
  </svg>
);

const DashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <polyline points="20,6 9,17 4,12" strokeWidth="2" />
  </svg>
);

export const listOptions: ListOption[] = [
  // Basic lists
  {
    label: "Bullet List",
    type: "bulletList",
    icon: ListIcon,
    style: "disc",
    category: "basic",
    cssListStyleType: "disc",
  },
  {
    label: "Numbered List",
    type: "orderedList",
    icon: ListOrderedIcon,
    style: "decimal",
    category: "basic",
    cssListStyleType: "decimal",
  },
  {
    label: "Task List",
    type: "taskList",
    icon: ListTodoIcon,
    style: "checkbox",
    category: "basic",
    cssListStyleType: "none",
  },

  // Numbered variations
  {
    label: "Alphabet List (a, b, c)",
    type: "alphabetList",
    icon: AlphabetIcon,
    style: "lower-alpha",
    category: "numbered",
    cssListStyleType: "lower-alpha",
  },
  {
    label: "Alphabet List (A, B, C)",
    type: "upperAlphabetList",
    icon: AlphabetIcon,
    style: "upper-alpha",
    category: "numbered",
    cssListStyleType: "upper-alpha",
  },
  {
    label: "Roman Numerals (i, ii, iii)",
    type: "lowerRomanList",
    icon: RomanIcon,
    style: "lower-roman",
    category: "numbered",
    cssListStyleType: "lower-roman",
  },
  {
    label: "Roman Numerals (I, II, III)",
    type: "upperRomanList",
    icon: RomanIcon,
    style: "upper-roman",
    category: "numbered",
    cssListStyleType: "upper-roman",
  },
];

export const extendedListShortcutKeys: Record<ListType, string> = {
  bulletList: "Ctrl-Shift-8",
  orderedList: "Ctrl-Shift-7",
  taskList: "Ctrl-Shift-9",
  alphabetList: "Ctrl-Shift-A",
  romanList: "Ctrl-Shift-R",
  upperAlphabetList: "Ctrl-Alt-A",
  lowerRomanList: "Ctrl-Alt-R",
  upperRomanList: "Ctrl-Alt-Shift-R",
};

export function canToggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor) return false;

  switch (type) {
    case "bulletList":
      return editor.can().toggleBulletList();
    case "orderedList":
      return editor.can().toggleOrderedList();
    case "taskList":
      return editor.can().toggleList("taskList", "taskItem");
    case "alphabetList":
    case "upperAlphabetList":
    case "lowerRomanList":
    case "upperRomanList":
      return editor.can().toggleOrderedList();
    default:
      return false;
  }
}

export function isListActive(editor: Editor | null, type: ListType): boolean {
  if (!editor) return false;

  // Basic checks first
  switch (type) {
    case "bulletList":
      return editor.isActive("bulletList") && !editor.isActive("taskList");
    case "orderedList":
      return editor.isActive("orderedList");
    case "taskList":
      return editor.isActive("taskList");
  }

  // Check for custom styled lists
  const { selection } = editor.state;
  const { $from } = selection;

  // Find the closest list node
  let depth = $from.depth;
  let listNode = null;

  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type.name === "bulletList" || node.type.name === "orderedList") {
      listNode = node;
      break;
    }
    depth--;
  }

  if (!listNode) return false;

  // Check the list style attribute
  const listStyle = listNode.attrs?.listStyleType;
  const option = listOptions.find((opt) => opt.type === type);

  if (option && listStyle) {
    return listStyle === option.cssListStyleType;
  }

  return false;
}
export function toggleExtendedList(
  editor: Editor | null,
  type: ListType
): void {
  if (!editor) return;

  const option = listOptions.find((opt) => opt.type === type);
  if (!option) return;

  // Check if the exact same list type is already active
  const isCurrentTypeActive = isListActive(editor, type);

  // If the same type is active, toggle it off
  if (isCurrentTypeActive) {
    switch (type) {
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "taskList":
        editor.chain().focus().toggleList("taskList", "taskItem").run();
        break;
      default:
        // For custom list types, turn off the list
        const { selection } = editor.state;
        const { $from } = selection;
        let depth = $from.depth;

        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type.name === "bulletList") {
            editor.chain().focus().toggleBulletList().run();
            return;
          } else if (node.type.name === "orderedList") {
            editor.chain().focus().toggleOrderedList().run();
            return;
          }
          depth--;
        }
        break;
    }
    return;
  }

  // Check what type of list is currently active
  const isInBulletList =
    editor.isActive("bulletList") && !editor.isActive("taskList");
  const isInOrderedList = editor.isActive("orderedList");
  const isInTaskList = editor.isActive("taskList");

  switch (type) {
    case "bulletList":
      if (isInOrderedList) {
        editor.chain().focus().toggleOrderedList().toggleBulletList().run();
      } else if (isInTaskList) {
        editor
          .chain()
          .focus()
          .toggleList("taskList", "taskItem")
          .toggleBulletList()
          .run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
      break;

    case "orderedList":
      if (isInBulletList) {
        editor.chain().focus().toggleBulletList().toggleOrderedList().run();
      } else if (isInTaskList) {
        editor
          .chain()
          .focus()
          .toggleList("taskList", "taskItem")
          .toggleOrderedList()
          .run();
      } else {
        editor.chain().focus().toggleOrderedList().run();
      }
      break;

    case "taskList":
      if (isInBulletList) {
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .toggleList("taskList", "taskItem")
          .run();
      } else if (isInOrderedList) {
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .toggleList("taskList", "taskItem")
          .run();
      } else {
        editor.chain().focus().toggleList("taskList", "taskItem").run();
      }
      break;

    case "alphabetList":
    case "upperAlphabetList":
    case "lowerRomanList":
    case "upperRomanList":
      // Convert to ordered list with custom styling
      if (isInBulletList) {
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .toggleOrderedList()
          .updateAttributes("orderedList", {
            listStyleType: option.cssListStyleType,
            style: `list-style-type: ${option.cssListStyleType};`,
          })
          .run();
      } else if (isInTaskList) {
        editor
          .chain()
          .focus()
          .toggleList("taskList", "taskItem")
          .toggleOrderedList()
          .updateAttributes("orderedList", {
            listStyleType: option.cssListStyleType,
            style: `list-style-type: ${option.cssListStyleType};`,
          })
          .run();
      } else if (isInOrderedList) {
        // Already an ordered list, just update attributes
        editor
          .chain()
          .focus()
          .updateAttributes("orderedList", {
            listStyleType: option.cssListStyleType,
            style: `list-style-type: ${option.cssListStyleType};`,
          })
          .run();
      } else {
        // Create new ordered list with styling
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .updateAttributes("orderedList", {
            listStyleType: option.cssListStyleType,
            style: `list-style-type: ${option.cssListStyleType};`,
          })
          .run();
      }
      break;
  }
}

export function getExtendedListOption(type: ListType): ListOption | undefined {
  return listOptions.find((option) => option.type === type);
}

export function getListOptionsByCategory(
  category: ListOption["category"]
): ListOption[] {
  return listOptions.filter((option) => option.category === category);
}

export interface ListButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  type: ListType;
  text?: string;
  hideWhenUnavailable?: boolean;
}

export const ListButton = React.forwardRef<HTMLButtonElement, ListButtonProps>(
  (
    {
      editor: providedEditor,
      type,
      hideWhenUnavailable = false,
      className = "",
      onClick,
      text,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor);
    const listOption = getExtendedListOption(type);
    const isActive = isListActive(editor, type);
    const shortcutKey = extendedListShortcutKeys[type as ListType];

    const Icon = listOption?.icon || ListIcon;

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);

        if (!e.defaultPrevented && editor) {
          toggleExtendedList(editor, type);
        }
      },
      [onClick, editor, type]
    );

    if (!editor || !editor.isEditable || !canToggleList(editor, type)) {
      return null;
    }

    return (
      <Button
        type="button"
        className={className.trim()}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        aria-label={listOption?.label || type}
        aria-pressed={isActive}
        tooltip={listOption?.label || type}
        shortcutKeys={shortcutKey}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    );
  }
);

ListButton.displayName = "ListButton";

export interface ExtendedListDropdownMenuProps
  extends Omit<ButtonProps, "type"> {
  editor?: Editor;
  types?: ListType[];
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showCategories?: boolean;
}

export function ListDropdownMenu({
  editor: providedEditor,
  types = [
    "bulletList",
    "orderedList",
    "taskList",
    "alphabetList",
    "upperAlphabetList",
    "lowerRomanList",
    "upperRomanList",
  ],
  hideWhenUnavailable = false,
  onOpenChange,
  showCategories = true,
  ...props
}: ExtendedListDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const availableOptions = React.useMemo(() => {
    return listOptions.filter(
      (option) =>
        types.includes(option.type) && canToggleList(editor, option.type)
    );
  }, [editor, types]);

  const categorizedOptions = React.useMemo(() => {
    const categories = ["basic", "numbered", "symbols", "special"] as const;
    return categories.reduce((acc, category) => {
      const options = availableOptions.filter(
        (opt) => opt.category === category
      );
      if (options.length > 0) {
        acc[category] = options;
      }
      return acc;
    }, {} as Record<string, ListOption[]>);
  }, [availableOptions]);

  const activeOption = React.useMemo(() => {
    return availableOptions.find((option) => isListActive(editor, option.type));
  }, [editor, availableOptions]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  if (!editor || !editor.isEditable || availableOptions.length === 0) {
    return null;
  }

  const ActiveIcon = activeOption?.icon || ListIcon;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          data-active-state={activeOption ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="List options"
          tooltip="List"
          {...props}
        >
          <ActiveIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {showCategories ? (
          Object.entries(categorizedOptions).map(
            ([category, options], categoryIndex) => (
              <React.Fragment key={category}>
                {categoryIndex > 0 && <DropdownMenuSeparator />}
                <DropdownMenuGroup>
                  {options.map((option) => (
                    <DropdownMenuItem key={option.type} asChild>
                      <ListButton
                        editor={editor}
                        type={option.type}
                        text={option.label}
                        hideWhenUnavailable={hideWhenUnavailable}
                        tooltip=""
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </React.Fragment>
            )
          )
        ) : (
          <DropdownMenuGroup>
            {availableOptions.map((option) => (
              <DropdownMenuItem key={option.type} asChild>
                <ListButton
                  editor={editor}
                  type={option.type}
                  text={option.label}
                  hideWhenUnavailable={hideWhenUnavailable}
                  tooltip=""
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ListDropdownMenu;
