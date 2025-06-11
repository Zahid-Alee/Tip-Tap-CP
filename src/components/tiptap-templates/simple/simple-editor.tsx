import * as React from "react";
import { forwardRef } from "react";
import { EditorContext } from "@tiptap/react";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
// import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

// --- Custom Extensions ---
import { Link } from "@/components/tiptap-extension/link-extension";
import { Selection } from "@/components/tiptap-extension/selection-extension";
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension";
import { all, createLowlight } from "lowlight";

// --- Table Extensions ---
import {
  TableBubbleMenu,
  TableFloatingMenu,
} from "@/components/tiptap-ui/table/table-bubble-menu";

// --- UI Primitives ---
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

import "@/components/tiptap-templates/simple/simple-editor.scss";

import MainToolbarContent from "@/components/tiptap-ui/toolbars/MainToolbarContent";
import MobileToolbarContent from "@/components/tiptap-ui/toolbars/MobileToolbarContent";
import CodeBlockComponent from "@/components/tiptap-ui/code/CodeBlockComponent";
import BubbleToolbar from "@/components/tiptap-ui/toolbars/BubbleToolbar";
import {
  LetterSpacing,
  LineHeight,
  WordSpacing,
} from "@/components/tiptap-extension/spacing/text-spacing-extension";
import { EditorHeader } from "./EditorHeader";
import EditorLoader from "@/components/tiptap-ui/Loader/EditorLoader";
import AIGeneratorModal from "@/components/tiptap-ui/gen-ai/AIGeneratorModal";
import { generateAiContent } from "@/services/openAiService";
import { TableExtensions } from "@/components/tiptap-extension/table-extension";
import { ResizableImage } from "../../tiptap-extension/Image/ImageExtension";
import { ImageBubbleMenu } from "../../tiptap-extension/Image/ImageBubbleMenu";


const lowlight = createLowlight(all);

interface EditorRefHandle {
  getEditor: () => any;
  getContent: () => string;
  setContent: (content: string) => void;
}

interface SimpleEditorProps {
  title?: string;
  saveUrl?: string;
  headers?: Record<string, string>;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
  onLoadSuccess?: (data: any) => void;
  onLoadError?: (error: Error) => void;
  initialContent?: string;
  readOnlyValue?: boolean;
  onReady?: () => void;
  translations: any[];
}

interface AIFormData {
  prompt: string;
  length: string;
  tone: string;
  [key: string]: string;
}

export const SimpleEditor = forwardRef<EditorRefHandle, SimpleEditorProps>(
  function SimpleEditor(
    {
      title,
      saveUrl,
      headers,
      onSaveSuccess,
      onSaveError,
      onLoadSuccess,
      initialContent,
      readOnlyValue = false,
      onReady,
      translations,
    },
    ref
  ) {
    const isMobile = useMobile();
    const windowSize = useWindowSize();
    const [mobileView, setMobileView] = React.useState("main");
    const [isReadOnly, setIsReadOnly] = React.useState(readOnlyValue);
    const [rect, setRect] = React.useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    const [saveStatus, setSaveStatus] = React.useState(null);
    const [editorInitialized, setEditorInitialized] = React.useState(false);
    const [isEditorLoading, setIsEditorLoading] = React.useState(true);
    const [isAIModalOpen, setIsAIModalOpen] = React.useState<boolean>(false);
    const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
    const [translationHistory, setTranslationHistory] =
      React.useState(translations);

    const editorRef = React.useRef<any>(null);

    const handleGenerateContent = React.useCallback(
      async (formData: AIFormData) => {
        const currentEditor = editorRef.current;
        if (!currentEditor) return;

        setIsGenerating(true);

        try {
          const generateResponse = await generateAiContent(formData);

          if (generateResponse && generateResponse.content) {
            Promise.resolve().then(() => {
              if (generateResponse.replaceExisting) {
                currentEditor.commands.setContent(generateResponse.content);
              } else {
                const currentContent = currentEditor.getHTML();

                const needsSeparator =
                  !currentContent.trim().endsWith("</p>") &&
                  !currentContent.trim().endsWith("</h1>") &&
                  !currentContent.trim().endsWith("</h2>") &&
                  !currentContent.trim().endsWith("</h3>") &&
                  !currentContent.trim().endsWith("</h4>") &&
                  !currentContent.trim().endsWith("</h5>") &&
                  !currentContent.trim().endsWith("</h6>") &&
                  !currentContent.trim().endsWith("</ul>") &&
                  !currentContent.trim().endsWith("</ol>");

                let combinedContent;

                if (needsSeparator) {
                  combinedContent = `${currentContent}<p></p>${generateResponse.content}`;
                } else {
                  combinedContent = `${currentContent}${generateResponse.content}`;
                }

                currentEditor.commands.setContent(combinedContent);

                const docSize = currentEditor.state.doc.content.size;
                currentEditor.commands.setTextSelection(docSize);
              }
              setIsAIModalOpen(false);
            });
          }
        } catch (error) {
          console.error("Error generating content:", error);
          alert("Error generating content. Please try again.");
        } finally {
          setIsGenerating(false);
        }
      },
      []
    );

    React.useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      getContent: () => editorRef.current?.getHTML(),
      setContent: (content) => {
        if (editorRef.current) {
          editorRef.current.commands.setContent(content);
        }
      },
    }));

    React.useEffect(() => {
      setRect(document.body.getBoundingClientRect());
    }, []);

    const editor = useEditor({
      immediatelyRender: true,
      editable: !readOnlyValue,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
        },
      },
      extensions: [
        LineHeight,
        WordSpacing,
        LetterSpacing,
        FontFamily,
        TextStyle,
        Color,
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlockLowlight.extend({
          addNodeView() {
            return ReactNodeViewRenderer(CodeBlockComponent);
          },
        }).configure({ lowlight }),
        TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
        Underline,
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Superscript,
        Subscript,
        Selection,
        ResizableImage,
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: (file: File) => handleImageUpload(file, headers || {}),
          onError: (error) => console.error("Upload failed:", error),
        }),
        TrailingNode,
        Link.configure({ openOnClick: false }),
        ...TableExtensions,
      ],
      content: initialContent,
      onTransaction: () => {
        if (saveStatus) {
          setSaveStatus(null);
        }
      },
      onCreate: () => {
        Promise.resolve().then(() => {
          editorRef.current = editor;
          setEditorInitialized(true);
          setIsEditorLoading(false);

          if (onReady) {
            onReady();
          }

          if (onLoadSuccess) {
            onLoadSuccess({ content: editor.getHTML() });
          }
        });
      },
    });

    React.useEffect(() => {
      if (editor && editorInitialized) {
        Promise.resolve().then(() => {
          setIsReadOnly(readOnlyValue);
          editor.setEditable(!readOnlyValue);
        });
      }
    }, [editor, readOnlyValue, editorInitialized]);

    React.useEffect(() => {
      if (!isMobile && mobileView !== "main") {
        setMobileView("main");
      }
    }, [isMobile, mobileView]);

    if (isEditorLoading) {
      return <EditorLoader />;
    }

    return (
      <EditorContext.Provider value={{ editor }}>
        <div className="editor-container">
          <EditorHeader
            editor={editor}
            title={title}
            saveUrl={saveUrl}
            headers={headers}
            onSaveSuccess={onSaveSuccess}
            onSaveError={onSaveError}
            readOnlyValue={isReadOnly}
            isGenerating={isGenerating}
            setIsAIModalOpen={setIsAIModalOpen}
            setSaveStatus={setSaveStatus}
            translationHistory={translationHistory}
          />

          <Toolbar
            style={
              isMobile
                ? {
                    bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                  }
                : {}
            }
            className="border border-border shadow-sm"
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                showToolBar={!isReadOnly}
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
                onEmojiClick={() => setMobileView("emoji")}
                editor={editor}
                isAIModalOpen={isAIModalOpen}
                translationHistory={translationHistory}
                setTranslationHistory={setTranslationHistory}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          {editor && <BubbleToolbar editor={editor} />}
          {editor && <ImageBubbleMenu editor={editor} />}
          {editor && (
            <TableBubbleMenu readonly={readOnlyValue} editor={editor} />
          )}
          {editor && (
            <TableFloatingMenu readonly={readOnlyValue} editor={editor} />
          )}

          <div className="content-wrapper">
            <EditorContent
              editor={editor}
              role="presentation"
              className={`simple-editor-content ${
                isReadOnly ? "read-only" : ""
              }`}
            />
          </div>
        </div>

        <AIGeneratorModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onGenerate={handleGenerateContent}
        />
      </EditorContext.Provider>
    );
  }
);
