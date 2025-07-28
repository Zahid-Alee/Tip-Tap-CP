// src/components/tiptap-ui/column/column-bubble-menu.tsx
import * as React from "react";
import { BubbleMenu, BubbleMenuProps } from "@tiptap/react";
import { ColumnInlineControls } from "./column-ui";
import { Editor } from "@tiptap/react";

interface ColumnBubbleMenuProps {
  editor: Editor;
  readonly?: boolean;
}

export const ColumnBubbleMenu: React.FC<ColumnBubbleMenuProps> = ({
  editor,
  readonly = false,
}) => {
  const shouldShow = ({ editor }: BubbleMenuProps) => {
    // Only show when columns or column is active and not readonly
    return !readonly && (editor.isActive("columns") || editor.isActive("column"));
  };

  if (readonly) return null;
  
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="columnBubbleMenu"
      shouldShow={shouldShow}
      tippyOptions={{
        placement: "top",
        animation: "fade",
        offset: [0, 10],
        interactive: true,
        appendTo: () => document.body,
        zIndex: 9999,
        delay: [200, 0], // Small delay before showing
      }}
      className="bg-white flex items-center border border-gray-200 rounded-lg shadow-lg overflow-hidden"
    >
      <ColumnInlineControls editor={editor} />
    </BubbleMenu>
  );
};

// Enhanced floating menu with better positioning
export const ColumnFloatingMenu: React.FC<ColumnBubbleMenuProps> = ({
  editor,
  readonly = false,
}) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = React.useState(false);
  const [columnInfo, setColumnInfo] = React.useState({ current: 0, total: 0 });
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (readonly) return;

    const updateMenu = () => {
      const selection = editor.state.selection;
      const isColumnsSelected = editor.isActive("columns");

      if (!isColumnsSelected) {
        setIsVisible(false);
        return;
      }

      // Find the columns node in the DOM
      const { view } = editor;
      const { from } = selection;
      const pos = view.coordsAtPos(from);
      
      if (pos) {
        const editorRect = view.dom.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        setPosition({
          top: pos.top + scrollTop - 50,
          left: Math.max(10, pos.left - (menuRef.current?.offsetWidth || 0) / 2),
        });
        setIsVisible(true);

        // Get column information
        const attributes = editor.getAttributes("columns");
        const currentColumn = getCurrentColumnIndex(editor);
        setColumnInfo({
          current: currentColumn + 1,
          total: attributes.columns || 2,
        });
      } else {
        setIsVisible(false);
      }
    };

    // Debounced update function
    let updateTimeout: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateMenu, 100);
    };

    const handleSelectionUpdate = () => debouncedUpdate();
    const handleFocus = () => debouncedUpdate();
    const handleBlur = () => {
      setTimeout(() => setIsVisible(false), 200); // Delay to allow interaction
    };
    const handleScroll = () => debouncedUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(updateTimeout);
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [editor, readonly]);

  // Helper function to determine current column index
  const getCurrentColumnIndex = (editor: Editor): number => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Find the column node
    for (let i = $from.depth; i >= 0; i--) {
      const node = $from.node(i);
      if (node.type.name === 'column') {
        // Find which column this is by checking siblings
        const parent = $from.node(i - 1);
        if (parent && parent.type.name === 'columns') {
          let columnIndex = 0;
          for (let j = 0; j < parent.content.childCount; j++) {
            const child = parent.content.child(j);
            if (child.type.name === 'column') {
              if (child === node) {
                return columnIndex;
              }
              columnIndex++;
            }
          }
        }
      }
    }
    return 0;
  };

  if (!isVisible || readonly) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center p-2 bg-white border border-gray-200 rounded-lg shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseEnter={() => setIsVisible(true)} // Keep visible on hover
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
          <span className="text-xs text-blue-700 font-medium">
            Column {columnInfo.current} of {columnInfo.total}
          </span>
        </div>
        <div className="w-px h-5 bg-gray-300"></div>
        <ColumnInlineControls editor={editor} />
      </div>
    </div>
  );
};

// Column selection menu with better hover detection
export const ColumnSelectionMenu: React.FC<ColumnBubbleMenuProps> = ({
  editor,
  readonly = false,
}) => {
  const [hoveredColumn, setHoveredColumn] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (readonly) return;

    let hoverTimeout: NodeJS.Timeout;

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const columnElement = target.closest('[data-type="column"]');
      
      if (columnElement && editor.isActive("columns")) {
        const rect = columnElement.getBoundingClientRect();
        const columnIndex = Array.from(
          columnElement.parentElement?.children || []
        ).findIndex(child => child === columnElement);
        
        if (columnIndex !== -1) {
          clearTimeout(hoverTimeout);
          
          setHoveredColumn(columnIndex);
          setPosition({
            top: rect.top - 35,
            left: rect.left + rect.width / 2,
          });
          setIsVisible(true);
        }
      } else {
        // Delay hiding to prevent flickering
        hoverTimeout = setTimeout(() => {
          setHoveredColumn(null);
          setIsVisible(false);
        }, 100);
      }
    };

    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        setHoveredColumn(null);
        setIsVisible(false);
      }, 200);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(hoverTimeout);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [editor, readonly]);

  if (!isVisible || hoveredColumn === null || readonly) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseEnter={() => setIsVisible(true)} // Keep visible on hover
      onMouseLeave={() => {
        setTimeout(() => setIsVisible(false), 100);
      }}
    >
      <span className="text-xs text-gray-600 font-medium">
        Column {hoveredColumn + 1}
      </span>
      <div className="w-px h-4 bg-gray-300"></div>
      <button
        className="flex items-center justify-center w-6 h-6 text-red-500 hover:bg-red-50 rounded transition-colors"
        onClick={() => {
          editor.chain().focus().removeColumn(hoveredColumn).run();
          setIsVisible(false);
        }}
        title="Remove this column"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Combined column menu component that shows all menus
export const ColumnMenus: React.FC<ColumnBubbleMenuProps> = ({
  editor,
  readonly = false,
}) => {
  return (
    <>
      <ColumnBubbleMenu editor={editor} readonly={readonly} />
      <ColumnFloatingMenu editor={editor} readonly={readonly} />
      <ColumnSelectionMenu editor={editor} readonly={readonly} />
    </>
  );
};