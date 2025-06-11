// src/components/tiptap-ui/table/table-ui.tsx
import * as React from "react";
import { Editor } from "@tiptap/react";

import {
  Table,
  Settings,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Merge,
  Split,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid3x3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@/components/tiptap-ui-primitive/button";

import "./table.scss";

interface TableButtonProps {
  editor: Editor | null;
}

export const TableButton: React.FC<TableButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;

    editor.chain().focus().insertTable({ rows, cols }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          title="Table"
        >
          <Table className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <div className="text-sm font-medium text-gray-700 mb-2 px-2">
          Insert Table
        </div>
        <DropdownMenuSeparator className="h-px bg-gray-200 my-1" />

        <div className="grid grid-cols-5 gap-1 p-2">
          {[...Array(5)].map((_, row) => (
            <React.Fragment key={`row-${row}`}>
              {[...Array(5)].map((_, col) => (
                <div
                  key={`cell-${row}-${col}`}
                  className="h-6 w-6 cursor-pointer border border-gray-300 rounded-sm hover:bg-blue-100 hover:border-blue-400 transition-colors"
                  onClick={() => insertTable(row + 1, col + 1)}
                  title={`${row + 1}×${col + 1} table`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>

        <DropdownMenuSeparator className="h-px bg-gray-200 my-1" />
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => insertTable(3, 3)}
        >
          <Grid3x3 className="mr-2 h-4 w-4" />
          3×3 Table
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => insertTable(5, 2)}
        >
          <Grid3x3 className="mr-2 h-4 w-4" />
          5×2 Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TableControlsButton: React.FC<TableButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  if (!isTableActive) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md"
          title="Table Controls"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <div className="text-sm font-medium text-gray-700 mb-2 px-2">
          Table Controls
        </div>
        {/* <DropdownMenuSeparator className="h-px bg-gray-200 my-1" /> */}
        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Add Column Before
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Add Column After
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          Delete Column
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator className="h-px bg-gray-200 my-1" /> */}
        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Add Row Before
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Add Row After
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          Delete Row
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator className="h-px bg-gray-200 my-1" /> */}
        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().mergeCells().run()}
        >
          <Merge className="mr-2 h-4 w-4" />
          Merge Cells
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().splitCell().run()}
        >
          <Split className="mr-2 h-4 w-4" />
          Split Cell
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator className="h-px bg-gray-200 my-1" /> */}
        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TableCellControls: React.FC<TableButtonProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-0 ">
      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setCellAttribute("backgroundColor", "#f3f4f6")
            .run()
        }
        title="Cell Background"
      >
        <div className="h-4 w-4 bg-gray-100 border border-gray-300 rounded" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => editor.chain().focus().mergeCells().run()}
        title="Merge Cells"
      >
        <Merge className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => editor.chain().focus().splitCell().run()}
        title="Split Cell"
      >
        <Split className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() =>
          editor.chain().focus().setCellAttribute("alignment", "left").run()
        }
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() =>
          editor.chain().focus().setCellAttribute("alignment", "center").run()
        }
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() =>
          editor.chain().focus().setCellAttribute("alignment", "right").run()
        }
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <TableControlsButton editor={editor} />
    </div>
  );
};
