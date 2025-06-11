import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Monitor,
  Square,
  Smartphone,
  RotateCcw
} from 'lucide-react';

// Types
interface ImageNodeAttrs {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  aspectRatio?: 'original' | '16:9' | '4:3' | '1:1' | '3:2';
}

interface NodeViewProps {
  node: { attrs: ImageNodeAttrs };
  updateAttributes: (attrs: Partial<ImageNodeAttrs>) => void;
  selected: boolean;
  editor: any;
}

// Resize handle component
const ResizeHandle = ({ position, onMouseDown, className = '' }) => {
  const handleClass = `absolute w-2 h-2 bg-blue-500 border border-white rounded-full hover:bg-blue-600 transition-colors cursor-${
    position.includes('n') || position.includes('s') ? 'ns' : 
    position.includes('e') || position.includes('w') ? 'ew' : 'nwse'
  }-resize`;

  const positionClasses = {
    'nw': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'ne': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'sw': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'se': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    'n': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    's': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    'w': 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'e': 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div
      className={`${handleClass} ${positionClasses[position]} ${className}`}
      onMouseDown={(e) => onMouseDown(e, position)}
    />
  );
};

// Main Image Node View Component
const ImageNodeView = ({ node, updateAttributes, selected, editor }) => {
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 400,
    height: node.attrs.height || 300
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const resizeRef = useRef(null);

  const { src, alt = '', alignment = 'center', aspectRatio = 'original' } = node.attrs;

  // Initialize dimensions on image load
  const handleImageLoad = useCallback(() => {
    if (!node.attrs.width && imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const maxWidth = 600;
      const scale = naturalWidth > maxWidth ? maxWidth / naturalWidth : 1;
      
      const newDimensions = {
        width: Math.round(naturalWidth * scale),
        height: Math.round(naturalHeight * scale)
      };
      
      setDimensions(newDimensions);
      updateAttributes(newDimensions);
    }
  }, [node.attrs.width, updateAttributes]);

  // Handle resize
  const handleResize = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;
    const aspectRatio = startWidth / startHeight;

    setIsResizing(true);

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (handle) {
        case 'se': // Southeast
          newWidth = Math.max(100, startWidth + deltaX);
          newHeight = Math.max(75, startHeight + deltaY);
          break;
        case 'sw': // Southwest
          newWidth = Math.max(100, startWidth - deltaX);
          newHeight = Math.max(75, startHeight + deltaY);
          break;
        case 'ne': // Northeast
          newWidth = Math.max(100, startWidth + deltaX);
          newHeight = Math.max(75, startHeight - deltaY);
          break;
        case 'nw': // Northwest
          newWidth = Math.max(100, startWidth - deltaX);
          newHeight = Math.max(75, startHeight - deltaY);
          break;
        case 'e': // East
          newWidth = Math.max(100, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'w': // West
          newWidth = Math.max(100, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'n': // North
          newHeight = Math.max(75, startHeight - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 's': // South
          newHeight = Math.max(75, startHeight + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      updateAttributes({
        width: Math.round(dimensions.width),
        height: Math.round(dimensions.height)
      });
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [dimensions, updateAttributes]);

  // Apply aspect ratio
  const applyAspectRatio = useCallback((ratio) => {
    if (!imageRef.current) return;

    let newWidth = dimensions.width;
    let newHeight = dimensions.height;

    switch (ratio) {
      case '16:9':
        newHeight = (newWidth * 9) / 16;
        break;
      case '4:3':
        newHeight = (newWidth * 3) / 4;
        break;
      case '1:1':
        newHeight = newWidth;
        break;
      case '3:2':
        newHeight = (newWidth * 2) / 3;
        break;
      case 'original':
        if (imageRef.current.naturalWidth && imageRef.current.naturalHeight) {
          const naturalRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
          newHeight = newWidth / naturalRatio;
        }
        break;
    }

    const newDimensions = { width: newWidth, height: Math.round(newHeight) };
    setDimensions(newDimensions);
    updateAttributes({ ...newDimensions, aspectRatio: ratio });
  }, [dimensions.width, updateAttributes]);

  // Alignment
  const handleAlignment = useCallback((newAlignment) => {
    updateAttributes({ alignment: newAlignment });
  }, [updateAttributes]);

  // Get alignment styles
  const getAlignmentStyles = () => {
    switch (alignment) {
      case 'left':
        return { display: 'block', marginLeft: 0, marginRight: 'auto' };
      case 'right':
        return { display: 'block', marginLeft: 'auto', marginRight: 0 };
      case 'center':
      default:
        return { display: 'block', marginLeft: 'auto', marginRight: 'auto' };
    }
  };

  // Show/hide controls
  useEffect(() => {
    setShowControls(selected);
  }, [selected]);

  return (
    <NodeViewWrapper className="relative">
      <div
        ref={containerRef}
        className={`relative inline-block ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
        style={{
          ...getAlignmentStyles(),
          width: dimensions.width,
          height: dimensions.height,
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !selected && setShowControls(false)}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded"
          draggable={false}
          onLoad={handleImageLoad}
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        />

        {/* Resize Handles */}
        {showControls && !isResizing && (
          <>
            <ResizeHandle position="nw" onMouseDown={handleResize} />
            <ResizeHandle position="ne" onMouseDown={handleResize} />
            <ResizeHandle position="sw" onMouseDown={handleResize} />
            <ResizeHandle position="se" onMouseDown={handleResize} />
            <ResizeHandle position="n" onMouseDown={handleResize} />
            <ResizeHandle position="s" onMouseDown={handleResize} />
            <ResizeHandle position="w" onMouseDown={handleResize} />
            <ResizeHandle position="e" onMouseDown={handleResize} />
          </>
        )}
      </div>

      {/* Bubble Menu */}
      {selected && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 100,
            placement: 'top',
            interactive: true,
            maxWidth: 'none',
          }}
        >
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Alignment Controls */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <button
                onClick={() => handleAlignment('left')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  alignment === 'left' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => handleAlignment('center')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  alignment === 'center' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => handleAlignment('right')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  alignment === 'right' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>

            {/* Aspect Ratio Controls */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <button
                onClick={() => applyAspectRatio('original')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  aspectRatio === 'original' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="Original"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => applyAspectRatio('16:9')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  aspectRatio === '16:9' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="16:9"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => applyAspectRatio('1:1')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  aspectRatio === '1:1' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="Square"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => applyAspectRatio('4:3')}
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  aspectRatio === '4:3' ? 'bg-blue-100 text-blue-600' : ''
                }`}
                title="4:3"
              >
                <Smartphone size={16} />
              </button>
            </div>

            {/* Size Display */}
            <div className="text-xs text-gray-500 px-1">
              {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
            </div>
          </div>
        </BubbleMenu>
      )}
    </NodeViewWrapper>
  );
};

// TipTap Node Definition
export const CustomImageNode = Node.create({
  name: 'customImage',
  
  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline: false,
  group: 'block',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width') || element.style.width;
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height') || element.style.height;
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
        }),
      },
      aspectRatio: {
        default: 'original',
        parseHTML: element => element.getAttribute('data-aspect-ratio') || 'original',
        renderHTML: attributes => ({
          'data-aspect-ratio': attributes.aspectRatio,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

// Usage example:
// editor.chain().focus().setImage({ src: 'your-image-url' }).run();