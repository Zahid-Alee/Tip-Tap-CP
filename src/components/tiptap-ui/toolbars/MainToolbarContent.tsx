import * as React from "react";
import { Editor } from "@tiptap/react";
import { Minus } from "lucide-react"; // Add this import
import Button from "@/components/tiptap-ui-primitive/button/button"; // Add this import
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { EmojiPopover } from "@/components/tiptap-ui/emoji-popover/emoji-popover";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import {
  HighlighterButton,
  HighlightPopover,
  DEFAULT_HIGHLIGHT_COLORS,
} from "@/components/tiptap-ui/highlight-popover";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { LinkButton, LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { NodeButton } from "@/components/tiptap-ui/node-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import FontPopover from "../font/FontPopover";
import TextColorPopover from "../font/TextColorPopover";
import BlockquoteColorPopover from "../blockquote-color/BlockquoteColorPopover";

import { TableButton } from "@/components/tiptap-ui/table/table-ui";
import { AIFeaturesButton } from "../ai-features/ai-features-ui";
import { TranslationModule } from "../translation/ai-translate";
import { MathFormulaButton } from "../math-formula/math-formula-button";
import HorizontalRuleButton from "../horizental-rule-button";
import OutputBlockButton from "../output-block/OutputBlockButton";
import BoldDropdownMenu from "../bold-dropdown-menu";
import TextSettingsDropdownMenu from "../text-settings-dropdown";
import { ColumnButton } from "../../tiptap-extension/column/column-ui";
import CardButton from "../card-button/card-button";

const EXTENDED_HIGHLIGHT_COLORS = [
  ...DEFAULT_HIGHLIGHT_COLORS,
  {
    label: "Gray",
    value: "#d1d5db",
    border: "#9ca3af",
  },
  {
    label: "Orange",
    value: "#fdba74",
    border: "#f97316",
  },
  {
    label: "Teal",
    value: "#5eead4",
    border: "#14b8a6",
  },
  {
    label: "Pink",
    value: "#fbcfe8",
    border: "#ec4899",
  },
];

const EXTENDED_TEXT_COLORS = [
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Red", value: "#ef4444" },
  { label: "Purple", value: "#a855f7" },
  { label: "Yellow", value: "#eab308" },
  { label: "Orange", value: "#f97316" },
  { label: "Gray", value: "#6b7280" },
];

interface MainToolbarContentProps {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onEmojiClick: () => void;
  isMobile: boolean;
  editor: Editor | null;
  showToolBar: boolean;
  isAIModalOpen?: boolean;
  translationHistory: object;
  setTranslationHistory: Function;
  handleFallbackTranslation: () => void;
}

const MainToolbarContent: React.FC<MainToolbarContentProps> = ({
  onHighlighterClick,
  onLinkClick,
  showToolBar,
  isMobile,
  editor,
  translationHistory,
  setTranslationHistory,
  handleFallbackTranslation,
}) => {
  if (!showToolBar) return null;
  if (!editor) return null;

  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} showCustomFontSize={true} />
        <ListDropdownMenu
          types={[
            "bulletList",
            "orderedList",
            "taskList",
            "alphabetList",
            "upperAlphabetList",
            "lowerRomanList",
            "upperRomanList",
            "squareList",
            "circleList",
          ]}
        />
        <BlockquoteColorPopover editor={editor} />
        <TableButton editor={editor} />
        <HorizontalRuleButton editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <BoldDropdownMenu editor={editor} />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <CardButton editor={editor} />

        <MarkButton type="code" />
        <NodeButton type="codeBlock" />
        <OutputBlockButton editor={editor} />
        <MathFormulaButton editor={editor} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <FontPopover editor={editor} />
        <TextColorPopover editor={editor} colors={EXTENDED_TEXT_COLORS} />
        <TextSettingsDropdownMenu editor={editor} />
        {!isMobile ? (
          <HighlightPopover
            colors={EXTENDED_HIGHLIGHT_COLORS}
            editor={editor}
          />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}

        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <EmojiPopover />
      </ToolbarGroup>

      <Spacer />
      {isMobile && <ToolbarSeparator />}

      <div className="p-3 flex items-center">
        <AIFeaturesButton editor={editor} />

        <TranslationModule
          translationHistory={translationHistory}
          setTranslationHistory={setTranslationHistory}
          editor={editor}
          handleFallbackTranslation={handleFallbackTranslation}
        />
      </div>
    </>
  );
};

export default MainToolbarContent;
