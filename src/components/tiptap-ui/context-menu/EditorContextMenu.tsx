import * as React from "react";
import { Editor } from "@tiptap/react";
import {
  Highlighter,
  ImagePlus,
  Link,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table,
  Quote,
  Heading1,
  Heading2,
  Type,
  Scissors,
  Copy,
  Clipboard,
} from "lucide-react";
import "./editor-context-menu.scss";

interface ContextMenuProps {
  editor: Editor | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export const EditorContextMenu: React.FC<ContextMenuProps> = ({
  editor,
  position,
  onClose,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!editor || !position) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, editor, position]);

  // Close menu on scroll
  React.useEffect(() => {
    if (!editor || !position) return;

    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose, editor, position]);

  // Calculate menu position to prevent overflow
  React.useEffect(() => {
    if (!editor || !position || !menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }

    setAdjustedPosition({ x, y });
  }, [position, editor]);

  // Early return after all hooks
  if (!editor || !position) return null;

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          editor.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    onClose();
  };

  const handleAddLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .insertContent({
          type: "text",
          text: text || url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    }
    onClose();
  };

  const menuItems: (MenuItem | "divider")[] = [
    // Clipboard operations
    {
      label: "Cut",
      icon: <Scissors size={16} />,
      action: () => {
        document.execCommand("cut");
        onClose();
      },
      disabled: editor.state.selection.empty,
    },
    {
      label: "Copy",
      icon: <Copy size={16} />,
      action: () => {
        document.execCommand("copy");
        onClose();
      },
      disabled: editor.state.selection.empty,
    },
    {
      label: "Paste",
      icon: <Clipboard size={16} />,
      action: () => {
        document.execCommand("paste");
        onClose();
      },
    },
    "divider",
    // Formatting
    {
      label: "Highlight",
      icon: <Highlighter size={16} />,
      action: () => {
        editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run();
        onClose();
      },
    },
    {
      label: "Add Link",
      icon: <Link size={16} />,
      action: handleAddLink,
    },
    {
      label: "Add Image",
      icon: <ImagePlus size={16} />,
      action: handleImageUpload,
    },
    {
      label: "Code Block",
      icon: <Code size={16} />,
      action: () => {
        editor.chain().focus().toggleCodeBlock().run();
        onClose();
      },
    },
    "divider",
    // Headings
    {
      label: "Heading 1",
      icon: <Heading1 size={16} />,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        onClose();
      },
    },
    {
      label: "Heading 2",
      icon: <Heading2 size={16} />,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
    },
    {
      label: "Paragraph",
      icon: <Type size={16} />,
      action: () => {
        editor.chain().focus().setParagraph().run();
        onClose();
      },
    },
    "divider",
    // Lists and structures
    {
      label: "Bullet List",
      icon: <List size={16} />,
      action: () => {
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
    },
    {
      label: "Numbered List",
      icon: <ListOrdered size={16} />,
      action: () => {
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
    },
    {
      label: "Blockquote",
      icon: <Quote size={16} />,
      action: () => {
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
    },
    {
      label: "Table",
      icon: <Table size={16} />,
      action: () => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "table",
            content: [
              {
                type: "tableRow",
                content: [
                  { type: "tableHeader", content: [{ type: "paragraph" }] },
                  { type: "tableHeader", content: [{ type: "paragraph" }] },
                  { type: "tableHeader", content: [{ type: "paragraph" }] },
                ],
              },
              {
                type: "tableRow",
                content: [
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                ],
              },
              {
                type: "tableRow",
                content: [
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                  { type: "tableCell", content: [{ type: "paragraph" }] },
                ],
              },
            ],
          })
          .run();
        onClose();
      },
    },
    "divider",
    // Alignment
    {
      label: "Align Left",
      icon: <AlignLeft size={16} />,
      action: () => {
        editor.chain().focus().setTextAlign("left").run();
        onClose();
      },
    },
    {
      label: "Align Center",
      icon: <AlignCenter size={16} />,
      action: () => {
        editor.chain().focus().setTextAlign("center").run();
        onClose();
      },
    },
    {
      label: "Align Right",
      icon: <AlignRight size={16} />,
      action: () => {
        editor.chain().focus().setTextAlign("right").run();
        onClose();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="editor-context-menu"
      style={{
        left: `${adjustedPosition?.x || 0}px`,
        top: `${adjustedPosition?.y || 0}px`,
      }}
    >
      {menuItems.map((item, index) => {
        if (item === "divider") {
          return (
            <div key={`divider-${index}`} className="context-menu-divider" />
          );
        }

        return (
          <button
            key={index}
            className={`context-menu-item ${item.disabled ? "disabled" : ""}`}
            onClick={item.action}
            disabled={item.disabled}
          >
            <span className="context-menu-icon">{item.icon}</span>
            <span className="context-menu-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
