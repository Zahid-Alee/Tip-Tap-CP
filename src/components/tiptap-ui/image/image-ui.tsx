import * as React from "react";
import { Editor } from "@tiptap/react";

import {
  Image as ImageIcon,
  Upload,
  Link,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  //   ArrowLeft,
  //   ArrowRight,
  MinusSquare,
  PlusSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { useUploadState } from "../../../hooks/use-upload-manager";

import "./image.scss";

interface ImageButtonProps {
  editor: Editor | null;
}

export const ImageButton: React.FC<ImageButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [showUrlInput, setShowUrlInput] = React.useState<boolean>(false);
  const { hasActiveUpload } = useUploadState();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("selectin file");
    const file = event.target.files?.[0];
    // console.log("file", file);
    if (!file) return;

    // Check if there's already an active upload
    if (hasActiveUpload) {
      alert(
        "Another image is currently uploading. Please wait for it to complete before uploading another image."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        editor.chain().focus().setImage({ src }).run();
      }
    };
    reader.readAsDataURL(file);
    // Reset the input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInsertUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowUrlInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInsertUrl();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <div className="text-sm font-medium text-gray-700 mb-2 px-2">
          Insert Image
        </div>
        <DropdownMenuSeparator className="h-px bg-gray-200 my-1" />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload from Computer
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileUpload}
          />
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <Link className="mr-2 h-4 w-4" />
          Insert from URL
        </DropdownMenuItem>

        {showUrlInput && (
          <div className="px-2 py-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow text-sm"
              />
              <Button
                className="h-8 px-2 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                onClick={handleInsertUrl}
              >
                Insert
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ImageControlsButton: React.FC<ImageButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isImageSelected = editor.isActive("image");

  if (!isImageSelected) return null;

  const setImageSize = (sizeDelta: number) => {
    const attrs = editor.getAttributes("image");
    const currentWidth = attrs.width ? parseInt(attrs.width) : 300;

    editor
      .chain()
      .focus()
      .setImage({
        ...attrs,
        width: currentWidth + sizeDelta,
      })
      .run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md"
          title="Image Controls"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
      >
        <div className="text-sm font-medium text-gray-700 mb-2 px-2">
          Image Controls
        </div>
        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => editor.chain().focus().setImageAlignment("left").run()}
        >
          <AlignLeft className="mr-2 h-4 w-4" />
          Align Left
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() =>
            editor.chain().focus().setImageAlignment("center").run()
          }
        >
          <AlignCenter className="mr-2 h-4 w-4" />
          Align Center
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() =>
            editor.chain().focus().setImageAlignment("right").run()
          }
        >
          <AlignRight className="mr-2 h-4 w-4" />
          Align Right
        </DropdownMenuItem>

        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => setImageSize(-20)}
        >
          <MinusSquare className="mr-2 h-4 w-4" />
          Decrease Size
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
          onClick={() => setImageSize(20)}
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Increase Size
        </DropdownMenuItem>

        <hr />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
          onClick={() => editor.chain().focus().deleteSelection().run()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ImageControls: React.FC<ImageButtonProps> = ({ editor }) => {
  if (!editor) return null;

  const isImageSelected = editor.isActive("image");

  if (!isImageSelected) return null;

  const setImageSize = (sizeDelta: number) => {
    const attrs = editor.getAttributes("image");
    const currentWidth = attrs.width ? parseInt(attrs.width) : 300;

    editor
      .chain()
      .focus()
      .setImage({
        ...attrs,
        width: currentWidth + sizeDelta,
      })
      .run();
  };

  return (
    <div className="flex items-center gap-1 p-0">
      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => editor.chain().focus().setImageAlignment("left").run()}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => editor.chain().focus().setImageAlignment("center").run()}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => editor.chain().focus().setImageAlignment("right").run()}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => setImageSize(-20)}
        title="Decrease Size"
      >
        <MinusSquare className="h-4 w-4" />
      </Button>

      <Button
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 transition-colors"
        onClick={() => setImageSize(20)}
        title="Increase Size"
      >
        <PlusSquare className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <ImageControlsButton editor={editor} />
    </div>
  );
};
