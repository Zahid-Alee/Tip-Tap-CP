import React, { useState } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Info,
  BookOpen,
  FileText,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/tiptap-ui-primitive/tooltip";

interface HoverWordBubbleMenuProps {
  editor: Editor | null;
  readonly?: boolean;
}

interface HoverWordForm {
  word: string;
  title: string;
  description: string;
  metadata: string;
}

export const HoverWordBubbleMenu: React.FC<HoverWordBubbleMenuProps> = ({
  editor,
  readonly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HoverWordForm>({
    word: "",
    title: "",
    description: "",
    metadata: "",
  });

  if (!editor || readonly) {
    return null;
  }

  const currentAttributes = editor.getAttributes("hoverWord");
  const hasHoverWord = editor.isActive("hoverWord");

  const handleCreate = () => {
    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to, " ");

    setFormData({
      word: selectedText,
      title: "",
      description: "",
      metadata: "",
    });
    setIsEditing(true);
  };

  const handleEdit = () => {
    setFormData({
      word: currentAttributes.word || "",
      title: currentAttributes.title || "",
      description: currentAttributes.description || "",
      metadata: currentAttributes.metadata || "",
    });
    setIsEditing(true);
  };

  const handleRemove = () => {
    editor.chain().focus().unsetHoverWord().run();
  };

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert("Word is required");
      return;
    }

    editor
      .chain()
      .focus()
      .setHoverWord({
        word: formData.word.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        metadata: formData.metadata.trim(),
      })
      .run();

    setIsEditing(false);
    setFormData({
      word: "",
      title: "",
      description: "",
      metadata: "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      word: "",
      title: "",
      description: "",
      metadata: "",
    });
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        maxWidth: 500,
        duration: 100,
        placement: "top",
        interactive: true,
        appendTo: () => document.body,
      }}
      className="bg-white shadow-xl rounded-lg border border-gray-200"
      shouldShow={({ editor, state }) => {
        const { selection } = state;

        if (selection.empty) return false;

        // Show if text is selected or if hover word is active
        return !selection.empty || editor.isActive("hoverWord");
      }}
    >
      {isEditing ? (
        <div className="p-4 space-y-3 min-w-[400px]">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              {hasHoverWord ? "Edit Hover Word" : "Create Hover Word"}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Keyword *
            </label>
            <input
              type="text"
              value={formData.word}
              onChange={(e) =>
                setFormData({ ...formData, word: e.target.value })
              }
              placeholder="e.g., Mathematics"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={hasHoverWord}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Introduction to Mathematics"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the term..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Additional Information
            </label>
            <textarea
              value={formData.metadata}
              onChange={(e) =>
                setFormData({ ...formData, metadata: e.target.value })
              }
              placeholder="Additional context or metadata..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Check size={14} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1 p-2">
          {hasHoverWord ? (
            <>
              <Tooltip delay={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Edit hover word</TooltipContent>
              </Tooltip>

              <Tooltip delay={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleRemove}
                    className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Remove hover word</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-blue-600 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create Hover Word
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Create a hover word from selected text
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </BubbleMenu>
  );
};

export default HoverWordBubbleMenu;
