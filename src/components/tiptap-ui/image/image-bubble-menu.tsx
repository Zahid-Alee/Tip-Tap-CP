import * as React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

interface ImageBubbleMenuProps {
  editor: Editor | null;
}

const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null;

  const deleteImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const getAlignmentButtonClasses = (alignment: string) =>
    `p-1 rounded transition-colors duration-200 ${
      editor.isActive({ textAlign: alignment })
        ? "bg-blue-100 text-blue-600"
        : "hover:bg-gray-100 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
    }`;

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top" }}
      className="bubble-menu bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1 flex items-center gap-2"
      shouldShow={({ editor }) => editor.isActive("image")}
    >
      <div className="flex items-center gap-2">
        {/* Alignment Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={getAlignmentButtonClasses("left")}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={getAlignmentButtonClasses("center")}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={getAlignmentButtonClasses("right")}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          type="button"
          onClick={deleteImage}
          className="p-1 rounded hover:bg-red-100 text-gray-600 dark:text-gray-300 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors duration-200"
          title="Delete Image"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </BubbleMenu>
  );
};

export default ImageBubbleMenu;
