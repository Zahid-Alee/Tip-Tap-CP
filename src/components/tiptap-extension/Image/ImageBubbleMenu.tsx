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
  WrapText,
  BoxSelect,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/tiptap-ui-primitive/tooltip";

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

  const handleFloat = (float: "left" | "right" | null) => {
    editor.chain().focus().setImageFloat(float).run();
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
        maxWidth: 400,
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
          <Tooltip delay={300}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  editor.chain().focus().setImageCaption(tempCaption).run();
                  setShowCaptionInput(false);
                }}
                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
              >
                <Check size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Apply caption</TooltipContent>
          </Tooltip>
          <Tooltip delay={300}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setShowCaptionInput(false);
                  setTempCaption(currentAttributes.caption || "");
                }}
                className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
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
          <Tooltip delay={300}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLinkSubmit}
                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
              >
                <Check size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Apply link</TooltipContent>
          </Tooltip>
          <Tooltip delay={300}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLinkCancel}
                className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleAlignment("left")}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    currentAttributes.align === "left"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <AlignLeft size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Align left</TooltipContent>
            </Tooltip>

            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleAlignment("center")}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    currentAttributes.align === "center"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <AlignCenter size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Align center</TooltipContent>
            </Tooltip>

            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleAlignment("right")}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    currentAttributes.align === "right"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <AlignRight size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Align right</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <div className="flex items-center gap-1">
            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFloat("left")}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    currentAttributes.float === "left"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <WrapText size={16} className="transform scale-x-[-1]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Float left - text wraps on right</TooltipContent>
            </Tooltip>

            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFloat(null)}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    !currentAttributes.float
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <BoxSelect size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>No float - block layout</TooltipContent>
            </Tooltip>

            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFloat("right")}
                  className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                    currentAttributes.float === "right"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <WrapText size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Float right - text wraps on left</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <div className="flex items-center gap-1">
            <Tooltip delay={300}>
              <TooltipTrigger asChild>
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
                >
                  <Type size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {hasCaption ? "Edit caption" : "Add caption"}
              </TooltipContent>
            </Tooltip>

            {hasLink ? (
              <>
                <Tooltip delay={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleEditLink}
                      className="p-2 rounded hover:bg-gray-100 text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit link</TooltipContent>
                </Tooltip>
                <Tooltip delay={300}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRemoveLink}
                      className="p-2 rounded hover:bg-gray-100 text-orange-600 transition-colors"
                    >
                      <Unlink size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove link</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Tooltip delay={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleAddLink}
                    className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <LinkIcon size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add link</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <div className="flex items-center">
            <Tooltip delay={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete image</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </BubbleMenu>
  );
};
