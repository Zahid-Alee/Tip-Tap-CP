// src/components/tiptap-ui/table/table-bubble-menu.tsx
import * as React from "react";
import { BubbleMenu, BubbleMenuProps } from "@tiptap/react/menus";
import { TableCellControls } from "./table-ui";
import { Editor } from "@tiptap/react";

interface TableBubbleMenuProps {
  editor: Editor;
  readonly: Boolean;
}

export const TableBubbleMenu: React.FC<TableBubbleMenuProps> = ({
  editor,
  readonly,
}) => {
  const shouldShow = ({ editor }: BubbleMenuProps) => {
    return editor.isActive("tableCell") || editor.isActive("tableHeader");
  };

  if (readonly) return null;
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={shouldShow}
      options={{
        placement: "top",
      }}
      className="bg-white flex items-center p-1 border border-gray-200 rounded-md shadow-md"
    >
      <TableCellControls editor={editor} />
    </BubbleMenu>
  );
};

export const TableFloatingMenu: React.FC<TableBubbleMenuProps> = ({
  editor,
}) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const updateMenu = () => {
      const selection = editor.state.selection;
      const isTableSelected = editor.isActive("table");

      if (!isTableSelected) {
        setIsVisible(false);
        return;
      }

      // Find table DOM element
      const dom = editor.view.dom;
      const tableNode = dom.querySelector(".ProseMirror-selectednode");

      if (tableNode) {
        const rect = tableNode.getBoundingClientRect();
        setPosition({
          top: rect.top - 50,
          left: rect.left,
        });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("focus", updateMenu);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updateMenu);
      editor.off("focus", updateMenu);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute z-50 flex items-center p-1 bg-white border border-gray-200 rounded-md shadow-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <TableCellControls editor={editor} />
    </div>
  );
};
