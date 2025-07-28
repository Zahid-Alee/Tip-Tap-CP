// src/components/tiptap-extension/column/column-node-view.tsx
import React, { useState, useRef, useCallback } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor } from '@tiptap/react'

interface ColumnNodeViewProps {
  node: ProseMirrorNode
  editor: Editor
  getPos: () => number
  updateAttributes: (attributes: Record<string, any>) => void
  deleteNode: () => void
}

export const ColumnNodeView: React.FC<ColumnNodeViewProps> = ({
  node,
  editor,
  getPos,
  updateAttributes,
  deleteNode,
}) => {
  const { columns, gap, widths } = node.attrs
  const [isResizing, setIsResizing] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthsRef = useRef<string[]>([])

  // Convert any relative units to pixels for easier calculation
  const normalizeWidths = useCallback((widths: string[], containerWidth: number): number[] => {
    return widths.map(width => {
      if (width.endsWith('fr')) {
        const frValue = parseFloat(width)
        const totalFr = widths.reduce((sum, w) => {
          return sum + (w.endsWith('fr') ? parseFloat(w) : 0)
        }, 0)
        return (frValue / totalFr) * containerWidth
      } else if (width.endsWith('px')) {
        return parseFloat(width)
      } else if (width.endsWith('%')) {
        return (parseFloat(width) / 100) * containerWidth
      }
      return containerWidth / columns // fallback
    })
  }, [columns])

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const currentWidths = widths || Array(columns).fill('1fr')
    
    setIsResizing(true)
    setDragIndex(index)
    startXRef.current = e.clientX
    startWidthsRef.current = [...currentWidths]

    const normalizedWidths = normalizeWidths(currentWidths, containerWidth)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return

      const deltaX = moveEvent.clientX - startXRef.current
      const newWidths = [...normalizedWidths]
      
      // Adjust the current column and next column
      const minWidth = 50 // Minimum column width in pixels
      const leftColumn = Math.max(minWidth, newWidths[index] + deltaX)
      const rightColumn = Math.max(minWidth, newWidths[index + 1] - deltaX)
      
      // Only update if both columns are above minimum width
      if (leftColumn >= minWidth && rightColumn >= minWidth) {
        newWidths[index] = leftColumn
        newWidths[index + 1] = rightColumn
        
        // Convert back to appropriate units
        const updatedWidths = newWidths.map(width => `${width}px`)
        updateAttributes({ widths: updatedWidths })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setDragIndex(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [columns, widths, updateAttributes, normalizeWidths])

  const currentWidths = widths || Array(columns).fill('1fr')
  const gridTemplateColumns = currentWidths.join(' ')

  return (
    <NodeViewWrapper className="column-layout-wrapper">
      <div 
        ref={containerRef}
        className="tiptap-columns-container"
        style={{
          display: 'grid',
          gridTemplateColumns,
          gap,
          position: 'relative',
          minHeight: '100px',
          border: editor.isFocused && editor.isActive('columns') ? '2px solid #3b82f6' : '1px solid transparent',
          borderRadius: '4px',
          padding: '4px',
        }}
        data-columns={columns}
        data-gap={gap}
      >
        <NodeViewContent />
        
        {/* Resize handles */}
        {editor.isFocused && columns > 1 && (
          <>
            {Array.from({ length: columns - 1 }).map((_, index) => (
              <div
                key={`resize-handle-${index}`}
                className="column-resize-handle"
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  width: '8px',
                  background: isResizing && dragIndex === index 
                    ? 'rgba(59, 130, 246, 0.8)' 
                    : 'rgba(59, 130, 246, 0.3)',
                  cursor: 'col-resize',
                  zIndex: 10,
                  left: `calc(${currentWidths.slice(0, index + 1).join(' + ')} + ${gap} * ${index + 1} - 4px)`,
                  borderRadius: '2px',
                  opacity: isResizing && dragIndex === index ? 1 : 0.6,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  if (!isResizing) {
                    e.currentTarget.style.opacity = '0.6'
                  }
                }}
              />
            ))}
          </>
        )}

        {/* Column indicators */}
        {editor.isFocused && editor.isActive('columns') && (
          <div className="column-indicators" style={{
            position: 'absolute',
            top: '-24px',
            left: '0',
            right: '0',
            height: '20px',
            display: 'flex',
            gap,
          }}>
            {Array.from({ length: columns }).map((_, index) => (
              <div
                key={`indicator-${index}`}
                style={{
                  flex: widths ? `0 0 ${widths[index]}` : '1',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '2px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                  fontWeight: '500',
                }}
              >
                Col {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}