// src/components/tiptap-ui/column/column-ui.tsx
import * as React from "react";
import { Editor } from "@tiptap/react";
import {
  Columns,
  Settings,
  Plus,
  Minus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid3x3,
  Move,
  SplitSquareHorizontal,
  Layout,
  Sidebar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  // DropdownMenuLabel,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@/components/tiptap-ui-primitive/button";

import './styles.scss'

interface ColumnButtonProps {
  editor: Editor | null;
}

// Template configurations with preview icons
const COLUMN_TEMPLATES = [
  {
    id: '2-equal',
    name: '2 Equal Columns',
    icon: SplitSquareHorizontal,
    preview: [1, 1],
    description: 'Two equal width columns'
  },
  {
    id: '3-equal',
    name: '3 Equal Columns',
    icon: Grid3x3,
    preview: [1, 1, 1],
    description: 'Three equal width columns'
  },
  {
    id: '4-equal',
    name: '4 Equal Columns',
    icon: Columns,
    preview: [1, 1, 1, 1],
    description: 'Four equal width columns'
  },
  {
    id: '2-sidebar-left',
    name: 'Left Sidebar',
    icon: Sidebar,
    preview: [0.7, 2],
    description: 'Narrow left column, wide right'
  },
  {
    id: '2-sidebar-right',
    name: 'Right Sidebar',
    icon: Sidebar,
    preview: [2, 0.7],
    description: 'Wide left column, narrow right'
  },
  {
    id: '3-center-focus',
    name: 'Center Focus',
    icon: AlignCenter,
    preview: [1, 2, 1],
    description: 'Wide center column with sidebars'
  },
  {
    id: '2-narrow-wide',
    name: '1:2 Layout',
    icon: AlignLeft,
    preview: [1, 2],
    description: 'Narrow-wide column layout'
  },
  {
    id: '2-wide-narrow',
    name: '2:1 Layout',
    icon: AlignRight,
    preview: [2, 1],
    description: 'Wide-narrow column layout'
  },
]

// Template preview component
const TemplatePreview: React.FC<{ preview: number[]; className?: string }> = ({ 
  preview, 
  className = "" 
}) => (
  <div className={`flex gap-0.5 ${className}`}>
    {preview.map((ratio, index) => (
      <div
        key={index}
        className="bg-blue-400 rounded-sm"
        style={{
          height: '16px',
          flex: ratio,
          minWidth: '8px',
        }}
      />
    ))}
  </div>
)

export const ColumnButton: React.FC<ColumnButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const insertTemplate = (templateId: string) => {
    if (!editor) return;
    const template = COLUMN_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      editor.chain().focus().insertColumns(template.preview.length, templateId).run();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          title="Insert Columns"
        >
          <Columns className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <label className="text-sm font-medium text-gray-700 px-2 py-1">
          Column Layouts
        </label>
        <DropdownMenuSeparator />

        {/* Quick insert grid */}
        <div className="p-2 mb-2">
          <div className="text-xs text-gray-500 mb-2">Quick Insert</div>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((columnCount) => (
              <div
                key={`quick-${columnCount}`}
                className="flex flex-col items-center p-2 cursor-pointer border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
                onClick={() => insertTemplate(`${columnCount}-equal`)}
                title={`${columnCount} equal columns`}
              >
                <TemplatePreview preview={Array(columnCount).fill(1)} className="mb-1" />
                <span className="text-xs text-gray-600">{columnCount}</span>
              </div>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Template list */}
        <div className="max-h-64 overflow-y-auto">
          {COLUMN_TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            return (
              <DropdownMenuItem
                key={template.id}
                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                onClick={() => insertTemplate(template.id)}
              >
                <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {template.description}
                  </div>
                </div>
                <TemplatePreview preview={template.preview} className="ml-2 flex-shrink-0" />
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ColumnControlsButton: React.FC<ColumnButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isColumnActive = editor.isActive("columns");
  if (!isColumnActive) return null;

  const currentNode = editor.getAttributes("columns");
  const { columns, gap, widths } = currentNode;

  const applyTemplate = (templateId: string) => {
    editor.chain().focus().applyColumnTemplate(templateId).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors rounded-md"
          title="Column Settings"
        >
          <Settings className="h-4 w-4 text-blue-600" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <label className="text-sm font-medium text-gray-700 px-2 py-1">
          Column Settings
        </label>
        <DropdownMenuSeparator />

        <div className="px-2 py-2 bg-gray-50 rounded-md mb-2">
          <div className="text-xs text-gray-600 mb-1">
            Current Layout: {columns} columns
          </div>
          {widths && (
            <div className="text-xs text-gray-500">
              Widths: {widths.join(', ')}
            </div>
          )}
        </div>

        {/* Column controls */}
        <div className="flex gap-2 mb-2 px-2">
          <Button
            className="flex-1 h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
            onClick={() => editor.chain().focus().addColumn().run()}
            disabled={columns >= 6}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Column
          </Button>
          
          <Button
            className="flex-1 h-8 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            onClick={() => editor.chain().focus().removeColumn().run()}
            disabled={columns <= 1}
          >
            <Minus className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Gap controls */}
        <div className="px-2 py-2">
          <div className="text-xs text-gray-500 mb-2">Column Gap</div>
          <div className="grid grid-cols-5 gap-1">
            {['0', '0.5rem', '1rem', '1.5rem', '2rem'].map((gapSize) => (
              <Button
                key={gapSize}
                className={`h-7 px-1 text-xs rounded transition-colors ${
                  gap === gapSize 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => editor.chain().focus().setColumnGap(gapSize).run()}
              >
                {gapSize === '0' ? 'None' : gapSize.replace('rem', '')}
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Template presets */}
        <div className="px-2 py-2">
          <div className="text-xs text-gray-500 mb-2">Apply Template</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {COLUMN_TEMPLATES
              .filter(template => template.preview.length === columns)
              .map((template) => {
                const IconComponent = template.icon;
                return (
                  <Button
                    key={template.id}
                    className="w-full h-8 px-2 text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300 justify-start"
                    onClick={() => applyTemplate(template.id)}
                  >
                    <IconComponent className="mr-2 h-3 w-3" />
                    <span className="flex-1 text-left">{template.name}</span>
                    <TemplatePreview preview={template.preview} className="ml-2" />
                  </Button>
                );
              })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Reset and remove */}
        <div className="px-2 py-2 space-y-1">
          <Button
            className="w-full h-8 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
            onClick={() => editor.chain().focus().setColumnWidths(Array(columns).fill('1fr')).run()}
          >
            <AlignCenter className="mr-2 h-3 w-3" />
            Reset to Equal Width
          </Button>
          
          <Button
            className="w-full h-8 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            onClick={() => {
              // Convert columns back to regular content
              const { selection } = editor.state;
              const { $from } = selection;
              
              for (let i = $from.depth; i >= 0; i--) {
                const node = $from.node(i);
                if (node.type.name === 'columns') {
                  const pos = $from.start(i);
                  const content = [];
                  
                  // Extract content from all columns
                  node.content.forEach((column) => {
                    if (column.type.name === 'column') {
                      column.content.forEach((block) => {
                        content.push(block);
                      });
                    }
                  });
                  
                  editor.chain()
                    .focus()
                    .setTextSelection({ from: pos - 1, to: pos + node.nodeSize - 1 })
                    .deleteSelection()
                    .insertContent(content)
                    .run();
                  break;
                }
              }
            }}
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Remove Columns
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ColumnInlineControls: React.FC<ColumnButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isColumnActive = editor.isActive("columns");
  if (!isColumnActive) return null;

  const currentNode = editor.getAttributes("columns");
  const { columns } = currentNode;

  return (
    <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
        {columns} Columns
      </div>
      
      <div className="w-px h-5 bg-gray-300"></div>
      
      <Button
        className="h-7 w-7 p-0 rounded hover:bg-green-50 hover:text-green-700 transition-colors"
        onClick={() => editor.chain().focus().addColumn().run()}
        disabled={columns >= 6}
        title="Add Column"
      >
        <Plus className="h-3 w-3" />
      </Button>

      <Button
        className="h-7 w-7 p-0 rounded hover:bg-red-50 hover:text-red-700 transition-colors"
        onClick={() => editor.chain().focus().removeColumn().run()}
        disabled={columns <= 1}
        title="Remove Column"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <div className="w-px h-5 bg-gray-300"></div>

      <ColumnControlsButton editor={editor} />
    </div>
  );
};