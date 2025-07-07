import * as React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { NodeButton } from "@/components/tiptap-ui/node-button";
import { HighlightPopover } from "@/components/tiptap-ui/highlight-popover";
import TextColorPopover from "../font/TextColorPopover";
import "./toolbar.scss";

interface BubbleToolbarProps {
  editor: Editor | null;
}

const BubbleToolbar: React.FC<BubbleToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
      }}
      className="bg-white shadow-lg rounded-lg border border-gray-200  px-2 py-1 flex gap-2"
      shouldShow={({ editor, state }) => {
        const { empty } = state.selection;

        if (empty) return false;

        if (editor.isActive("codeBlock")) return false;

        if (editor.isActive("tableCell") || editor.isActive("tableHeader"))
          return false;

        if (editor.isActive("resizableImage")) return false;

        if(editor.isActive("link")) return false;
        if(editor.isActive("code-block")) return false;

        return true;

      }}
    >
      <div className="flex items-center gap-1">
        <MarkButton type="bold" size="sm" />
        <MarkButton type="italic" size="sm" />
        <MarkButton type="underline" size="sm" />
        <MarkButton type="strike" size="sm" />
      </div>

      <div className="flex items-center gap-1">
        <TextColorPopover editor={editor} />
        <HighlightPopover />
        <MarkButton type="code" />
      </div>

      <div className="flex items-center gap-1">
        {/* <LinkPopover /> */}
        <NodeButton type="codeBlock" size="sm" />
      </div>
    </BubbleMenu>
  );
};

export default BubbleToolbar;
