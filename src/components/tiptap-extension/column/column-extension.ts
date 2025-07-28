// src/components/tiptap-extension/column/column-extension.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ColumnNodeView } from './column-node-view'

export interface ColumnOptions {
  HTMLAttributes: Record<string, any>
  allowGutters: boolean
  defaultColumns: number
  maxColumns: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    column: {
      insertColumns: (columns?: number, template?: string) => ReturnType
      addColumn: () => ReturnType
      removeColumn: (index?: number) => ReturnType
      setColumnWidths: (widths: string[]) => ReturnType
      setColumnGap: (gap: string) => ReturnType
      applyColumnTemplate: (template: string) => ReturnType
    }
  }
}

// Predefined column templates
export const COLUMN_TEMPLATES = {
  '2-equal': { columns: 2, widths: ['1fr', '1fr'], gap: '1rem' },
  '3-equal': { columns: 3, widths: ['1fr', '1fr', '1fr'], gap: '1rem' },
  '4-equal': { columns: 4, widths: ['1fr', '1fr', '1fr', '1fr'], gap: '1rem' },
  '2-sidebar-left': { columns: 2, widths: ['250px', '1fr'], gap: '1.5rem' },
  '2-sidebar-right': { columns: 2, widths: ['1fr', '250px'], gap: '1.5rem' },
  '3-center-focus': { columns: 3, widths: ['1fr', '2fr', '1fr'], gap: '1rem' },
  '2-narrow-wide': { columns: 2, widths: ['1fr', '2fr'], gap: '1rem' },
  '2-wide-narrow': { columns: 2, widths: ['2fr', '1fr'], gap: '1rem' },
}

export const ColumnExtension = Node.create<ColumnOptions>({
  name: 'columns',
  
  group: 'block',
  content: 'column+',
  isolating: true,
  defining: true,
  
  addOptions() {
    return {
      HTMLAttributes: {},
      allowGutters: true,
      defaultColumns: 2,
      maxColumns: 6,
    }
  },

  addAttributes() {
    return {
      columns: {
        default: this.options.defaultColumns,
        parseHTML: element => {
          const columns = element.getAttribute('data-columns')
          return columns ? parseInt(columns, 10) : this.options.defaultColumns
        },
        renderHTML: attributes => ({
          'data-columns': attributes.columns,
        }),
      },
      gap: {
        default: '1rem',
        parseHTML: element => element.getAttribute('data-gap') || '1rem',
        renderHTML: attributes => ({
          'data-gap': attributes.gap,
        }),
      },
      widths: {
        default: null,
        parseHTML: element => {
          const widths = element.getAttribute('data-widths')
          return widths ? JSON.parse(widths) : null
        },
        renderHTML: attributes => {
          if (!attributes.widths) return {}
          return { 'data-widths': JSON.stringify(attributes.widths) }
        },
      },
      template: {
        default: null,
        parseHTML: element => element.getAttribute('data-template') || null,
        renderHTML: attributes => {
          if (!attributes.template) return {}
          return { 'data-template': attributes.template }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { columns, gap, widths } = node.attrs
    
    const gridTemplateColumns = widths 
      ? widths.join(' ') 
      : `repeat(${columns}, 1fr)`
    
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'columns',
          class: 'tiptap-columns',
          style: `display: grid; grid-template-columns: ${gridTemplateColumns}; gap: ${gap}; min-height: 100px;`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnNodeView, {
      className: 'column-layout-wrapper',
    })
  },

  addCommands() {
    return {
      insertColumns:
        (columns = this.options.defaultColumns, template) =>
        ({ commands, state }) => {
          const { selection } = state
          const { $from } = selection

          let attrs = { columns }
          
          // Apply template if provided
          if (template && COLUMN_TEMPLATES[template as keyof typeof COLUMN_TEMPLATES]) {
            const templateConfig = COLUMN_TEMPLATES[template as keyof typeof COLUMN_TEMPLATES]
            attrs = { ...templateConfig, template }
          }

          // Create column content
          const columnContent = []
          for (let i = 0; i < columns; i++) {
            columnContent.push({
              type: 'column',
              content: [{ type: 'paragraph' }],
            })
          }

          return commands.insertContentAt($from.pos, {
            type: this.name,
            attrs,
            content: columnContent,
          })
        },

      addColumn:
        () =>
        ({ commands, state, tr }) => {
          const { selection } = state
          const { $from } = selection

          let columnsNode = null
          let columnsPos = null

          for (let i = $from.depth; i >= 0; i--) {
            const node = $from.node(i)
            if (node.type.name === this.name) {
              columnsNode = node
              columnsPos = $from.start(i)
              break
            }
          }

          if (!columnsNode || columnsNode.attrs.columns >= this.options.maxColumns) {
            return false
          }

          const newColumns = columnsNode.attrs.columns + 1
          const currentWidths = columnsNode.attrs.widths || Array(columnsNode.attrs.columns).fill('1fr')
          const newWidths = [...currentWidths, '1fr']

          // Update node attributes
          tr.setNodeMarkup(columnsPos - 1, null, {
            ...columnsNode.attrs,
            columns: newColumns,
            widths: newWidths,
          })

          // Insert new column at the end
          const insertPos = columnsPos + columnsNode.nodeSize - 1
          tr.insert(insertPos, state.schema.nodes.column.create(null, [
            state.schema.nodes.paragraph.create()
          ]))

          return true
        },

      removeColumn:
        (index) =>
        ({ commands, state, tr }) => {
          const { selection } = state
          const { $from } = selection

          let columnsNode = null
          let columnsPos = null

          for (let i = $from.depth; i >= 0; i--) {
            const node = $from.node(i)
            if (node.type.name === this.name) {
              columnsNode = node
              columnsPos = $from.start(i)
              break
            }
          }

          if (!columnsNode || columnsNode.attrs.columns <= 1) {
            return false
          }

          const newColumns = columnsNode.attrs.columns - 1
          const currentWidths = columnsNode.attrs.widths || Array(columnsNode.attrs.columns).fill('1fr')
          
          // Remove width for the column being deleted
          const newWidths = currentWidths.filter((_, i) => i !== (index ?? currentWidths.length - 1))

          // If no index specified, remove the last column
          const removeIndex = index ?? columnsNode.attrs.columns - 1

          // Find and remove the column
          let currentIndex = 0
          let removePos = null
          let removeSize = 0

          for (let i = 0; i < columnsNode.content.childCount; i++) {
            const child = columnsNode.content.child(i)
            if (child.type.name === 'column') {
              if (currentIndex === removeIndex) {
                removePos = columnsPos + columnsNode.content.offsetAt(i)
                removeSize = child.nodeSize
                break
              }
              currentIndex++
            }
          }

          if (removePos !== null) {
            tr.delete(removePos, removePos + removeSize)
            tr.setNodeMarkup(columnsPos - 1, null, {
              ...columnsNode.attrs,
              columns: newColumns,
              widths: newWidths,
            })
          }

          return true
        },

      setColumnWidths:
        (widths) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { widths })
        },

      setColumnGap:
        (gap) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { gap })
        },

      applyColumnTemplate:
        (template) =>
        ({ commands }) => {
          const templateConfig = COLUMN_TEMPLATES[template as keyof typeof COLUMN_TEMPLATES]
          if (!templateConfig) return false
          
          return commands.updateAttributes(this.name, {
            ...templateConfig,
            template,
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-2': () => this.editor.commands.insertColumns(2, '2-equal'),
      'Mod-Shift-3': () => this.editor.commands.insertColumns(3, '3-equal'),
      'Mod-Shift-4': () => this.editor.commands.insertColumns(4, '4-equal'),
    }
  },
})

// Individual Column Node
export const ColumnItemExtension = Node.create({
  name: 'column',
  
  group: 'block',
  content: 'block+',
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: element => element.style.width || null,
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { style: `width: ${attributes.width}` }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'column',
          class: 'tiptap-column',
          style: 'min-height: 100px; padding: 8px;',
        },
        HTMLAttributes
      ),
      0,
    ]
  },
})

export const ColumnExtensions = [ColumnExtension, ColumnItemExtension]