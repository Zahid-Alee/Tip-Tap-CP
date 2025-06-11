// src/components/tiptap-extension/table/table-extension.ts
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'

// Custom table extensions
export const CustomTableExtension = Table.extend({
  // Adding additional keyboard shortcuts for better table navigation
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Add tab navigation support
      Tab: ({ editor }) => {
        if (editor.isActive('table')) {
          return editor.commands.goToNextCell()
        }
        return false
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('table')) {
          return editor.commands.goToPreviousCell()
        }
        return false
      },
    }
  },
}).configure({
  resizable: true,
  lastColumnResizable: true,
  allowTableNodeSelection: true,
})

export const CustomTableRowExtension = TableRow

export const CustomTableHeaderExtension = TableHeader

export const CustomTableCellExtension = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {}
          }
          
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute('colspan')
          return colspan ? parseInt(colspan, 10) : 1
        },
        renderHTML: attributes => {
          if (attributes.colspan === 1) {
            return {}
          }

          return { colspan: attributes.colspan }
        },
      },
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute('rowspan')
          return rowspan ? parseInt(rowspan, 10) : 1
        },
        renderHTML: attributes => {
          if (attributes.rowspan === 1) {
            return {}
          }

          return { rowspan: attributes.rowspan }
        },
      },
    }
  },
})

// Export all table related extensions as a single bundle
export const TableExtensions = [
  CustomTableExtension,
  CustomTableRowExtension,
  CustomTableHeaderExtension,
  CustomTableCellExtension,
]