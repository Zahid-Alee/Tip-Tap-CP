import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2 
} from "lucide-react";

interface ImageBubbleMenuProps {
  editor: Editor | null;
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().setImageAlign(align).run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
      }}
      className="bg-white shadow-lg rounded-lg border border-gray-200 px-2 py-1 flex gap-2"
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        
        if (selection.empty) return false;
        
        return editor.isActive('resizableImage');
      }}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleAlignment('left')}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.getAttributes('resizableImage').align === 'left' 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600'
          }`}
          title="Align left"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onClick={() => handleAlignment('center')}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.getAttributes('resizableImage').align === 'center' 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600'
          }`}
          title="Align center"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onClick={() => handleAlignment('right')}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.getAttributes('resizableImage').align === 'right' 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600'
          }`}
          title="Align right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <div className="flex items-center">
        <button
          onClick={handleDelete}
          className="p-2 rounded hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
          title="Delete image"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </BubbleMenu>
  );
};
