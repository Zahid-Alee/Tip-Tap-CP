import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { Info, Check, X, MessageSquare } from "lucide-react";
import Button from "../../tiptap-ui-primitive/button/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../tiptap-ui-primitive/popover/popover";
import "./hover-word-button.scss";

interface HoverWordButtonProps {
  editor: Editor | null;
}

interface HoverWordForm {
  word: string;
  title: string;
  description: string;
  metadata: string;
}

export const HoverWordButton: React.FC<HoverWordButtonProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<HoverWordForm>({
    word: "",
    title: "",
    description: "",
    metadata: "",
  });

  if (!editor) {
    return null;
  }

  const hasSelection = !editor.state.selection.empty;
  const isActive = editor.isActive("hoverWord");

  const handleOpen = () => {
    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to, " ");

    if (isActive) {
      // Edit existing hover word
      const currentAttributes = editor.getAttributes("hoverWord");
      setFormData({
        word: currentAttributes.word || selectedText,
        title: currentAttributes.title || "",
        description: currentAttributes.description || "",
        metadata: currentAttributes.metadata || "",
      });
    } else {
      // Create new hover word
      setFormData({
        word: selectedText,
        title: "",
        description: "",
        metadata: "",
      });
    }
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert("Keyword is required");
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

    setIsOpen(false);
    setFormData({
      word: "",
      title: "",
      description: "",
      metadata: "",
    });
  };

  const handleRemove = () => {
    editor.chain().focus().unsetHoverWord().run();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      word: "",
      title: "",
      description: "",
      metadata: "",
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          onClick={handleOpen}
          className={isActive ? "is-active" : ""}
          disabled={!hasSelection && !isActive}
          tooltip={
            isActive
              ? "Edit Hover Word"
              : hasSelection
              ? "Create Hover Word"
              : "Select text to create hover word"
          }
        >
          <MessageSquare className="tiptap-button-icon" size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="hover-word-popover" align="start">
        <div className="p-4 space-y-3 w-[380px]">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              {isActive ? "Edit Hover Word" : "Create Hover Word"}
            </h3>
          </div>

          {/* Display selected text for reference */}
          {formData.word && (
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              <span className="text-xs font-medium text-blue-700">
                Selected text:{" "}
              </span>
              <span className="text-sm font-semibold text-blue-900">
                {formData.word}
              </span>
            </div>
          )}

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

          <div className="flex  gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="py-1.5 px-3   flex text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Cancel"
            >
              Cancel
            </button>

            {/* <div className="flex   gap-2"> */}
            {isActive && (
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Check size={14} />
              {isActive ? "Update" : "Create"}
            </button>
            {/* </div> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HoverWordButton;
