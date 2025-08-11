import React, { useState } from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  LinkIcon,
  Unlink,
  Check,
  X,
  Edit,
  Type,
} from "lucide-react";

interface ImageBubbleMenuProps {
  editor: Editor | null;
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return null;
  }

  const currentAttributes = editor.getAttributes("resizableImage");
  const hasLink = !!currentAttributes.href;
  const hasCaption = !!currentAttributes.caption;
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [tempCaption, setTempCaption] = useState(
    currentAttributes.caption || ""
  );

  const handleAlignment = (align: "left" | "center" | "right") => {
    editor.chain().focus().setImageAlign(align).run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const handleAddLink = () => {
    setLinkUrl("");
    setIsLinkDialogOpen(true);
  };

  const handleEditLink = () => {
    setLinkUrl(currentAttributes.href || "");
    setIsLinkDialogOpen(true);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().removeImageLink().run();
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      // Add protocol if missing
      const url =
        linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
          ? linkUrl
          : `https://${linkUrl}`;

      editor.chain().focus().setImageLink(url).run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  const handleLinkCancel = () => {
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLinkSubmit();
    } else if (e.key === "Escape") {
      handleLinkCancel();
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
        interactive: true,
      }}
      className="bg-white shadow-lg rounded-lg border border-gray-200 px-2 py-1"
      shouldShow={({ editor, state }) => {
        const { selection } = state;

        if (selection.empty) return false;

        return editor.isActive("resizableImage");
      }}
    >
      {showCaptionInput ? (
        <div className="flex items-center gap-2 p-2">
          <input
            type="text"
            value={tempCaption}
            onChange={(e) => setTempCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                editor.chain().focus().setImageCaption(tempCaption).run();
                setShowCaptionInput(false);
              } else if (e.key === "Escape") {
                setShowCaptionInput(false);
                setTempCaption(currentAttributes.caption || "");
              }
            }}
            placeholder="Enter caption..."
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={() => {
              editor.chain().focus().setImageCaption(tempCaption).run();
              setShowCaptionInput(false);
            }}
            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
            title="Apply caption"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setShowCaptionInput(false);
              setTempCaption(currentAttributes.caption || "");
            }}
            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
      {isLinkDialogOpen ? (
        <div className="flex items-center gap-2 p-2">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter URL..."
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleLinkSubmit}
            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
            title="Apply link"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleLinkCancel}
            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAlignment("left")}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                currentAttributes.align === "left"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
              title="Align left"
            >
              <AlignLeft size={16} />
            </button>

            <button
              onClick={() => handleAlignment("center")}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                currentAttributes.align === "center"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
              title="Align center"
            >
              <AlignCenter size={16} />
            </button>

            <button
              onClick={() => handleAlignment("right")}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                currentAttributes.align === "right"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
              title="Align right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (!hasCaption) {
                  setShowCaptionInput(true);
                } else {
                  // If caption exists, open editor
                  setTempCaption(currentAttributes.caption || "");
                  setShowCaptionInput(true);
                }
              }}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                hasCaption ? "text-blue-600" : "text-gray-600"
              }`}
              title={hasCaption ? "Edit caption" : "Add caption"}
            >
              <Type size={16} />
            </button>

            {hasLink ? (
              <>
                <button
                  onClick={handleEditLink}
                  className="p-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                  title="Edit link"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleRemoveLink}
                  className="p-2 rounded hover:bg-gray-100 text-orange-600 transition-colors"
                  title="Remove link"
                >
                  <Unlink size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={handleAddLink}
                className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                title="Add link"
              >
                <LinkIcon size={16} />
              </button>
            )}
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
        </div>
      )}
    </BubbleMenu>
  );
};
