

// Desktop popover component using the custom Popover
import * as React from "react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { EditorContext } from "@tiptap/react";

import { Button } from "@/components/tiptap-ui-primitive/button";
import { EmojiIcon } from "@/components/tiptap-icons/emoji-icon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover";

export const EmojiPopover = () => {
  const { editor } = React.useContext(EditorContext);

  const insertEmoji = (emoji) => {
    if (editor) {
      editor.commands.insertContent(emoji.native);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button title="Insert emoji" aria-label="Insert emoji">
          <EmojiIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="p-0 border-0 overflow-hidden"
      >
        <Picker
          data={data}
          onEmojiSelect={insertEmoji}
          theme="light"
          previewPosition="none"
          skinTonePosition="none"
          emojiSize={20}
          emojiButtonSize={28}
          maxFrequentRows={0}
          perLine={8}
          navPosition="bottom"
        />
      </PopoverContent>
    </Popover>
  );
};

// Mobile emoji content view
export const EmojiContent = () => {
  const { editor } = React.useContext(EditorContext);

  const insertEmoji = (emoji) => {
    if (editor) {
      editor.commands.insertContent(emoji.native);
    }
  };

  return (
    <div className="w-full p-2">
      <Picker
        data={data}
        onEmojiSelect={insertEmoji}
        theme="light"
        previewPosition="none"
        skinTonePosition="none"
        emojiSize={18}
        emojiButtonSize={26}
        maxFrequentRows={0}
        perLine={8}
        navPosition="bottom"
        searchPosition="sticky"
      />
    </div>
  );
};

// Mobile emoji button
export const EmojiButtonMobile = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button onClick={onClick} title="Insert emoji" aria-label="Insert emoji">
      <EmojiIcon className="tiptap-button-icon" />
    </Button>
  );
};