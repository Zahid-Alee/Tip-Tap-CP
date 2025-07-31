import * as React from "react";
import { forwardRef } from "react";
import { EditorContext } from "@tiptap/react";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
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
import { CardNode } from "@/components/tiptap-node/card-node/card-node-extension";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-node/card-node/card-node.scss";
import "@/components/tiptap-ui/output-block/styles.scss";

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
import ExtendedListExtension from "../../tiptap-extension/list-extension";
import { FindReplace } from "../../tiptap-extension/find-replace/find-replace-extension";
import { Replace, Search } from "lucide-react";
import {
  FindReplacePanel,
  useFindReplaceShortcuts,
} from "../../tiptap-extension/find-replace/FindReplacePanel";
import Button from "../../tiptap-ui-primitive/button/button";
import { OutputBlock } from "../../tiptap-ui/output-block/OutputBlock";
import { Bold } from "../../tiptap-extension/spacing/text-spacing-extension";
import { ColumnExtensions } from "../../tiptap-extension/column/column-extension";
import { ColumnBubbleMenu } from "../../tiptap-extension/column/column-bubble-menu";

const lowlight = createLowlight(all);

// ===== TYPES =====
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

interface EditorState {
  mobileView: string;
  isReadOnly: boolean;
  rect: { x: number; y: number; width: number; height: number };
  saveStatus: any;
  editorInitialized: boolean;
  isEditorLoading: boolean;
  isAIModalOpen: boolean;
  isGenerating: boolean;
  translationHistory: any[];
  currentTranslationIndex: number;
  originalContent: string;
  isUpdatingFromTranslation: boolean;
  isFindReplaceOpen?: boolean;
  findReplaceMode?: "find" | "replace";
}

interface EditorToolbarProps {
  editor: any;
  isMobile: boolean;
  mobileView: string;
  isReadOnly: boolean;
  windowSize: { width: number; height: number };
  rect: { x: number; y: number; width: number; height: number };
  isAIModalOpen: boolean;
  translationHistory: any[];
  setTranslationHistory: (history: any[]) => void;
  setMobileView: (view: string) => void;
  onFind: () => void;
  onReplace: () => void;
}

interface EditorMenusProps {
  editor: any;
  readOnlyValue: boolean;
}

interface EditorContentWrapperProps {
  editor: any;
  isReadOnly: boolean;
  editorId?: string;
}

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (formData: AIFormData) => Promise<void>;
}

// ===== UTILITY FUNCTIONS =====
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== EDITOR CONFIGURATION =====
const useEditorExtensions = ({ readOnlyValue }) => {
  return [
    LineHeight,
    WordSpacing,
    LetterSpacing,
    Bold,
    FontFamily,
    TextStyle,
    Color,
    ExtendedListExtension,
    StarterKit.configure({
      codeBlock: false,
      bold: false,
    }),
    OutputBlock,

    CodeBlockLowlight.extend({
      addOptions() {
        return {
          ...this.parent?.(),
          lowlight: null,
          readOnlyValue: false,
        };
      },
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
      },
    }).configure({ lowlight, readOnlyValue }),

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
      upload: (file: File) =>
        handleImageUpload(file, {} as Record<string, string>),
      onError: (error) => console.error("Upload failed:", error),
    }),
    TrailingNode,
    Link.configure({ openOnClick: false }),
    CardNode,
    ...TableExtensions,
    ...ColumnExtensions,
    FindReplace,
  ];
};

// ===== EDITOR HOOKS =====
const useEditorState = (
  readOnlyValue: boolean,
  translations: any[]
): [EditorState, React.Dispatch<React.SetStateAction<EditorState>>] => {
  const [state, setState] = React.useState<EditorState>({
    mobileView: "main",
    isReadOnly: readOnlyValue,
    rect: { x: 0, y: 0, width: 0, height: 0 },
    saveStatus: null,
    editorInitialized: false,
    isEditorLoading: true,
    isAIModalOpen: false,
    isGenerating: false,
    translationHistory: translations,
    currentTranslationIndex: -1,
    originalContent: "",
    isUpdatingFromTranslation: false,
    isFindReplaceOpen: false,
    findReplaceMode: "find",
  });

  return [state, setState];
};

const useTranslationManagement = (
  translations: any[],
  initialContent?: string
) => {
  const getInitialEditorContent = React.useCallback(() => {
    if (translations && translations.length > 0) {
      return translations[0].text || "";
    }
    return initialContent || "";
  }, [translations, initialContent]);

  const updateTranslationDebounced = React.useMemo(
    () =>
      debounce(
        (
          content: string,
          translationIndex: number,
          translationHistory: any[],
          setTranslationHistory: (history: any[]) => void
        ) => {
          if (translationIndex >= 0 && translationHistory[translationIndex]) {
            setTranslationHistory(
              translationHistory.map((translation, index) =>
                index === translationIndex
                  ? {
                      ...translation,
                      text: content,
                      lastModified: new Date().toISOString(),
                    }
                  : translation
              )
            );
          }
        },
        1000
      ),
    []
  );

  return {
    getInitialEditorContent,
    updateTranslationDebounced,
  };
};

const FindReplaceToolbarButtons: React.FC<{
  onFind: () => void;
  onReplace: () => void;
  isReadOnly: boolean;
}> = ({ onFind, onReplace, isReadOnly }) => {
  if (isReadOnly) return null;

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        onClick={onFind}
        className=""
        tooltip="Find (Ctrl+F)"
      >
        <Search className="tiptap-button-icon" size={16} />
      </Button>
      <Button
        onClick={onReplace}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        tooltip="Replace (Ctrl+H)"
      >
        <Replace className="tiptap-button-icon" size={16} />
      </Button>
    </div>
  );
};

// ===== SUBCOMPONENTS =====
const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  isMobile,
  mobileView,
  isReadOnly,
  windowSize,
  rect,
  isAIModalOpen,
  translationHistory,
  setTranslationHistory,
  setMobileView,
  onFind,
  onReplace,
}) => {
  return (
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
        <>
          <FindReplaceToolbarButtons
            onFind={onFind}
            onReplace={onReplace}
            isReadOnly={isReadOnly}
          />
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
        </>
      ) : (
        <MobileToolbarContent
          type={mobileView === "highlighter" ? "highlighter" : "link"}
          onBack={() => setMobileView("main")}
        />
      )}
    </Toolbar>
  );
};

const EditorMenus: React.FC<EditorMenusProps> = ({ editor, readOnlyValue }) => {
  if (!readOnlyValue)
    return (
      <>
        {editor && <BubbleToolbar editor={editor} />}
        {editor && <ImageBubbleMenu editor={editor} />}
        {editor && <TableBubbleMenu readonly={readOnlyValue} editor={editor} />}
        {editor && (
          <ColumnBubbleMenu readonly={readOnlyValue} editor={editor} />
        )}
        {editor && (
          <TableFloatingMenu readonly={readOnlyValue} editor={editor} />
        )}
      </>
    );
};

const EditorContentWrapper: React.FC<EditorContentWrapperProps> = ({
  editor,
  isReadOnly,
  editorId,
}) => {
  const contentWrapperRef = React.useRef<HTMLDivElement>(null);
  const lastHeightRef = React.useRef<number>(0);

  React.useEffect(() => {
    const sendHeightToParent = () => {
      const el = contentWrapperRef.current;
      if (!el) return;

      const height = el.scrollHeight;

      if (height !== lastHeightRef.current) {
        lastHeightRef.current = height;
        window.parent.postMessage(
          { type: "IFRAME_HEIGHT", height: height + 60, editorId },
          "*"
        );
        // console.log("[AutoResizer] Sent new height:", height);
      }
    };

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedSend = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => sendHeightToParent(), 100);
    };

    const wrapper = contentWrapperRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver(debouncedSend);
    resizeObserver.observe(wrapper);

    const mutationObserver = new MutationObserver(debouncedSend);
    mutationObserver.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    sendHeightToParent(); // Initial send

    // 💡 Stop observing after 3 seconds if read-only
    let stopTimeout: ReturnType<typeof setTimeout> | null = null;
    if (isReadOnly) {
      stopTimeout = setTimeout(() => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        // console.log(
        //   "[AutoResizer] Disconnected observers after 3s (read-only)"
        // );
      }, 3000);
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (timeout) clearTimeout(timeout);
      if (stopTimeout) clearTimeout(stopTimeout);
    };
  }, [isReadOnly]);

  return (
    <div
      ref={contentWrapperRef}
      className={`content-wrapper ${isReadOnly ? "py-5" : "p-5"}`}
    >
      <EditorContent
        editor={editor}
        role="presentation"
        className={`simple-editor-content ${isReadOnly ? "read-only" : ""}`}
      />
    </div>
  );
};

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onGenerate }) => {
  return (
    <AIGeneratorModal
      isOpen={isOpen}
      onClose={onClose}
      onGenerate={onGenerate}
    />
  );
};

// ===== MAIN COMPONENT =====
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
      editorId,
    },
    ref
  ) {
    const isMobile = useMobile();
    const windowSize = useWindowSize();
    const [state, setState] = useEditorState(readOnlyValue, translations);
    const { getInitialEditorContent, updateTranslationDebounced } =
      useTranslationManagement(translations, initialContent);
    const extensions = useEditorExtensions({ readOnlyValue });
    const editorRef = React.useRef<any>(null);

    // ===== EDITOR HANDLERS =====
    const handleGenerateContent = React.useCallback(
      async (formData: AIFormData) => {
        const currentEditor = editorRef.current;
        if (!currentEditor) return;

        setState((prev) => ({ ...prev, isGenerating: true }));

        try {
          const generateResponse = await generateAiContent(formData);

          if (generateResponse && generateResponse.content) {
            Promise.resolve().then(() => {
              setState((prev) => ({
                ...prev,
                isUpdatingFromTranslation: true,
              }));

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

              setState((prev) => ({ ...prev, isAIModalOpen: false }));

              if (state.currentTranslationIndex >= 0) {
                const newContent = currentEditor.getHTML();
                updateTranslationDebounced(
                  newContent,
                  state.currentTranslationIndex,
                  state.translationHistory,
                  (history) =>
                    setState((prev) => ({
                      ...prev,
                      translationHistory: history,
                    }))
                );
              }

              setTimeout(
                () =>
                  setState((prev) => ({
                    ...prev,
                    isUpdatingFromTranslation: false,
                  })),
                100
              );
            });
          }
        } catch (error) {
          console.error("Error generating content:", error);
          alert("Error generating content. Please try again.");
        } finally {
          setState((prev) => ({ ...prev, isGenerating: false }));
        }
      },
      [
        state.currentTranslationIndex,
        state.translationHistory,
        updateTranslationDebounced,
      ]
    );

    const handleTranslationChange = React.useCallback((index: number) => {
      setState((prev) => ({ ...prev, currentTranslationIndex: index }));
    }, []);

    const handleOpenFind = React.useCallback(() => {
      setState((prev) => ({
        ...prev,
        isFindReplaceOpen: true,
        findReplaceMode: "find",
      }));
    }, []);

    const handleOpenReplace = React.useCallback(() => {
      setState((prev) => ({
        ...prev,
        isFindReplaceOpen: true,
        findReplaceMode: "replace",
      }));
    }, []);

    const handleCloseFindReplace = React.useCallback(() => {
      setState((prev) => ({
        ...prev,
        isFindReplaceOpen: false,
      }));
    }, []);

    useFindReplaceShortcuts(
      handleOpenFind,
      handleOpenReplace,
      state.isFindReplaceOpen,
      handleCloseFindReplace
    );

    // ===== EDITOR CONFIGURATION =====
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
      extensions,
      content: getInitialEditorContent(),
      onTransaction: () => {
        if (state.saveStatus) {
          setState((prev) => ({ ...prev, saveStatus: null }));
        }
      },
      onUpdate: ({ editor }) => {
        if (
          !state.isUpdatingFromTranslation &&
          state.currentTranslationIndex >= 0
        ) {
          const content = editor.getHTML();
          updateTranslationDebounced(
            content,
            state.currentTranslationIndex,
            state.translationHistory,
            (history) =>
              setState((prev) => ({ ...prev, translationHistory: history }))
          );
        }
      },
      onCreate: () => {
        Promise.resolve().then(() => {
          editorRef.current = editor;
          setState((prev) => ({
            ...prev,
            editorInitialized: true,
            isEditorLoading: false,
            currentTranslationIndex:
              translations && translations.length > 0 ? 0 : -1,
          }));

          if (onReady) {
            onReady();
          }

          if (onLoadSuccess) {
            onLoadSuccess({ content: editor.getHTML() });
          }
        });
      },
    });

    // ===== IMPERATIVE HANDLE =====
    React.useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      getContent: () => editorRef.current?.getHTML(),
      setContent: (content) => {
        if (editorRef.current) {
          setState((prev) => ({ ...prev, isUpdatingFromTranslation: true }));
          editorRef.current.commands.setContent(content);
          setTimeout(
            () =>
              setState((prev) => ({
                ...prev,
                isUpdatingFromTranslation: false,
              })),
            100
          );
        }
      },
    }));

    // ===== EFFECTS =====
    React.useEffect(() => {
      setState((prev) => ({
        ...prev,
        rect: document.body.getBoundingClientRect(),
      }));
    }, []);

    React.useEffect(() => {
      if (editor && state.editorInitialized) {
        Promise.resolve().then(() => {
          setState((prev) => ({ ...prev, isReadOnly: readOnlyValue }));
          editor.setEditable(!readOnlyValue);
        });
      }
    }, [editor, readOnlyValue, state.editorInitialized]);

    React.useEffect(() => {
      if (!isMobile && state.mobileView !== "main") {
        setState((prev) => ({ ...prev, mobileView: "main" }));
      }
    }, [isMobile, state.mobileView]);

    React.useEffect(() => {
      setState((prev) => ({ ...prev, translationHistory: translations }));

      if (editor && translations && translations.length > 0) {
        const newContent = translations[0].text || "";
        if (newContent !== editor.getHTML()) {
          setState((prev) => ({
            ...prev,
            isUpdatingFromTranslation: true,
            currentTranslationIndex: 0,
          }));
          editor.commands.setContent(newContent);
          setTimeout(
            () =>
              setState((prev) => ({
                ...prev,
                isUpdatingFromTranslation: false,
              })),
            100
          );
        }
      } else if (editor && (!translations || translations.length === 0)) {
        const content = initialContent || "";
        if (content !== editor.getHTML()) {
          setState((prev) => ({
            ...prev,
            isUpdatingFromTranslation: true,
            currentTranslationIndex: -1,
          }));
          editor.commands.setContent(content);
          setTimeout(
            () =>
              setState((prev) => ({
                ...prev,
                isUpdatingFromTranslation: false,
              })),
            100
          );
        }
      }
    }, [translations, editor, initialContent]);

    // ===== RENDER =====
    if (state.isEditorLoading) {
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
            readOnlyValue={state.isReadOnly}
            isGenerating={state.isGenerating}
            setIsAIModalOpen={(isOpen) =>
              setState((prev) => ({ ...prev, isAIModalOpen: isOpen }))
            }
            setSaveStatus={(status) =>
              setState((prev) => ({ ...prev, saveStatus: status }))
            }
            translationHistory={state.translationHistory}
            currentTranslationIndex={state.currentTranslationIndex}
            onTranslationChange={handleTranslationChange}
            setIsUpdatingFromTranslation={(isUpdating) =>
              setState((prev) => ({
                ...prev,
                isUpdatingFromTranslation: isUpdating,
              }))
            }
          />

          <FindReplacePanel
            editor={editor}
            isOpen={state.isFindReplaceOpen}
            onClose={handleCloseFindReplace}
            initialShowReplace={state.findReplaceMode === "replace"}
          />

          <EditorToolbar
            editor={editor}
            isMobile={isMobile}
            mobileView={state.mobileView}
            isReadOnly={state.isReadOnly}
            windowSize={windowSize}
            rect={state.rect}
            isAIModalOpen={state.isAIModalOpen}
            translationHistory={state.translationHistory}
            setTranslationHistory={(history) =>
              setState((prev) => ({ ...prev, translationHistory: history }))
            }
            setMobileView={(view) =>
              setState((prev) => ({ ...prev, mobileView: view }))
            }
            onFind={handleOpenFind}
            onReplace={handleOpenReplace}
          />

          <EditorMenus editor={editor} readOnlyValue={readOnlyValue} />

          <EditorContentWrapper
            editorId={editorId}
            editor={editor}
            isReadOnly={state.isReadOnly}
          />
        </div>

        <AIModal
          isOpen={state.isAIModalOpen}
          onClose={() =>
            setState((prev) => ({ ...prev, isAIModalOpen: false }))
          }
          onGenerate={handleGenerateContent}
        />
      </EditorContext.Provider>
    );
  }
);
