import * as React from "react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/tiptap-ui-primitive/tooltip";
import {
  Sparkles,
  Globe,
  Check,
  ChevronDown,
  PencilLine,
  X,
  Download,
  Upload,
  FileCode2,
  Wand2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import {
  convertMarkdownToHtml,
  convertMarkdownInSelection,
  getConversionSummary,
} from "../../../lib/markdown-scanner-utils";

// ---- Types ----
interface TranslationItem {
  title: string;
  text?: string;
  lastModified?: string;
  [key: string]: any; // allow extra metadata
}

interface EditorHeaderProps {
  title?: string;
  saveUrl?: string;
  headers?: Record<string, string>;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
  readOnlyValue?: boolean;
  editor?: any;
  setIsAIModalOpen?: (open: boolean) => void;
  isGenerating?: boolean;
  setSaveStatus?: (status: string) => void;
  translationHistory?: TranslationItem[];
  currentTranslationIndex?: number;
  onTranslationChange?: (index: number) => void;
  setIsUpdatingFromTranslation?: (updating: boolean) => void;
  setSelectedTranslation?: (id: string | null) => void;
  selectedTranslation: string | null;
}

const SaveIcon = () => (
  <svg
    color="#07A1DE"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export function EditorHeader({
  title = "Document Editor",
  saveUrl,
  headers,
  onSaveSuccess,
  onSaveError,
  readOnlyValue,
  editor,
  setIsAIModalOpen,
  isGenerating = true,
  setSaveStatus,
  translationHistory = [],
  currentTranslationIndex = -1,
  onTranslationChange,
  setIsUpdatingFromTranslation,
  setSelectedTranslation,
  selectedTranslation,
}: EditorHeaderProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanMessage, setScanMessage] = React.useState<string | null>(null);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] =
    React.useState(false);
  const [titleValue, setTitleValue] = React.useState(title);
  const [isEditTitle, setIsEditTitle] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // --- Utilities ---
  const triggerDownload = React.useCallback(
    (filename: string, data: string, mime: string) => {
      try {
        const blob = new Blob([data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
      }
    },
    []
  );

  // --- Export (HTML only) ---
  const handleExportHtml = () => {
    if (!editor) return;
    const html = editor.getHTML();

    triggerDownload(
      `${titleValue || "document"}.html`,
      html,
      "text/html;charset=utf-8"
    );
  };

  // --- Import (HTML only) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return;
      try {
        let html = text.trim();
        // Strip BOM
        html = html.replace(/^\uFEFF/, "");
        // If full HTML doc, extract body
        if (/<html[\s>]/i.test(html)) {
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) {
            html = bodyMatch[1];
          }
        }
        // Remove head + doctype
        html = html
          .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
          .replace(/<head[\s\S]*?<\/head>/gi, "")
          .trim();
        editor.commands.setContent(html); // emit update
      } catch (err) {
        console.error("HTML import failed", err);
      } finally {
        e.target.value = ""; // reset
      }
    };
    reader.readAsText(file);
  };

  const startImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "text/html,.html,.htm";
      fileInputRef.current.click();
    }
  };

  // --- Translation handling ---
  const handleApplyTranslation = (data, index: number) => {
    if (!editor) return;
    if (index < 0 || index >= translationHistory.length) return;

    if (data?.language) {
      setSelectedTranslation(data.language);
    } else {
      setSelectedTranslation(data?.targetLanguage || null);
    }

    const translation = translationHistory[index] as TranslationItem;
    setIsUpdatingFromTranslation?.(true);
    onTranslationChange?.(index);
    editor.commands.setContent(translation.text || "");
    setTimeout(() => setIsUpdatingFromTranslation?.(false), 100);
  };

  // --- Save ---
  const handleSave = async () => {
    if (!editor || !saveUrl) return;
    setIsSaving(true);

    const html = editor.getHTML();
    let translations = translationHistory || [];

    if (translations.length === 0) {
      translations = [
        {
          title: "Translate to English",
          text: html,
          language: "es",
          lastModified: new Date().toISOString(),
        },
      ];
    } else if (selectedTranslation == null) {
      translations = translations.map((t) => {
        if (t.language) {
          return {
            ...t,
            text: html,
            lastModified: new Date().toISOString(),
          };
        }
        return t;
      });
    } else {
      translations = translations.map((t) => {
        const lang = t.language || t.targetLanguage;
        if (lang == selectedTranslation) {
          return {
            ...t,
            text: html,
            lastModified: new Date().toISOString(),
          };
        }
        return t;
      });
    }

    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
        body: JSON.stringify({
          title: titleValue,
          content: html,
          translations: translations,
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const data = await res.json().catch(() => ({}));
      onSaveSuccess?.(data);
      setSaveStatus?.("saved");
    } catch (err) {
      console.error(err);
      onSaveError?.(err as Error);
      setSaveStatus?.("error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- AI Modal ---
  const handleOpenAIModal = () => setIsAIModalOpen?.(true);

  // --- Scan & Render Markdown ---
  const handleScanAndRender = async () => {
    if (!editor) return;

    setIsScanning(true);
    setScanMessage(null);

    try {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      let result;
      if (hasSelection) {
        // Convert only selected text
        const fullText = editor.getText();
        const beforeSelection = editor.state.doc.textBetween(0, from, "\n");
        const selectionText = editor.state.doc.textBetween(from, to, "\n");

        result = convertMarkdownInSelection(
          fullText,
          beforeSelection.length,
          beforeSelection.length + selectionText.length
        );

        if (result.success && result.conversions.length > 0) {
          // Store cursor position
          const savedSelection = { from, to };

          // Update content
          editor.commands.setContent(result.convertedHtml);

          // Restore selection (approximately)
          setTimeout(() => {
            try {
              editor.commands.setTextSelection(savedSelection);
            } catch (e) {
              // If selection restore fails, just focus
              editor.commands.focus();
            }
          }, 10);
        }
      } else {
        // Convert entire document
        const currentText = editor.getText();
        result = convertMarkdownToHtml(currentText);

        if (result.success && result.conversions.length > 0) {
          // Store cursor position
          const { from: cursorPos } = editor.state.selection;

          // Update content
          editor.commands.setContent(result.convertedHtml);

          // Restore cursor position (approximately)
          setTimeout(() => {
            try {
              const docSize = editor.state.doc.content.size;
              const newPos = Math.min(cursorPos, docSize - 1);
              editor.commands.setTextSelection(newPos);
            } catch (e) {
              // If cursor restore fails, just focus
              editor.commands.focus();
            }
          }, 10);
        }
      }

      // Update editor content if patterns were found
      if (result && result.success && result.conversions.length > 0) {
        // Patterns converted successfully - no message shown
      } else {
        // No patterns found - no message shown
      }
    } catch (error) {
      console.error("Markdown scan error:", error);
      setScanMessage("❌ Error scanning markdown. Please try again.");
      setTimeout(() => setScanMessage(null), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  if (readOnlyValue && translationHistory?.length <= 1) return;

  return (
    <>
      {/* Scan Message Toast */}
      {scanMessage && (
        <div
          className="fixed top-4 right-4 z-50 max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {scanMessage.startsWith("✓") ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : scanMessage.startsWith("❌") ? (
                <X className="h-5 w-5 text-red-600" />
              ) : (
                <FileCode2 className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{scanMessage}</p>
            </div>
            <button
              onClick={() => setScanMessage(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start p-3 gap-10 border-b bg-inherit">
        <div className="editor-title flex  max-w-3xl  items-start gap-4">
          {!readOnlyValue && (
            <div className="w-full">
              {isEditTitle && !readOnlyValue ? (
                <div className="bg-gray-50 flex   items-center gap-2 border border-gray-300 text-gray-900 px-2 rounded-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-gray-400">
                  <input
                    type="text"
                    id="first_name"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditTitle(false);
                      }
                    }}
                    style={{
                      width: `${Math.max(titleValue.length * 8 + 20, 150)}px`,
                    }}
                    className=" py-2   outline-none focus:outline-none"
                    placeholder="Enter title here"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditTitle(false)}
                    className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    <X
                      size={16}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </button>
                </div>
              ) : (
                <h2 className="text-base font-medium m-0">{titleValue}</h2>
              )}
            </div>
          )}

          {!isEditTitle && !readOnlyValue && (
            <button
              type="button"
              onClick={() => setIsEditTitle(true)}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <PencilLine size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {!readOnlyValue && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExportHtml}
                  className="flex items-center text-nowrap  px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-colors"
                  tooltip="Export HTML"
                >
                  <Upload className="h-4 w-4 mr-2" /> Export HTML
                </Button>
                <Button
                  onClick={startImport}
                  className="flex items-center px-3 py-2 text-nowrap bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-colors"
                  tooltip="Import HTML"
                >
                  <Download className="h-4 w-4 mr-2" /> Import HTML
                </Button>
                {/* <Button
                  onClick={handleScanAndRender}
                  className={`flex items-center px-3 py-2 text-nowrap bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-md transition-colors ${
                    isScanning ? "animate-pulse bg-green-100" : ""
                  }`}
                  tooltip="Scan & Render Markdown (Ctrl+Shift+M)"
                  disabled={isScanning}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  <span>Render Markdown</span>
                  {isScanning && (
                    <span className="ml-2 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </Button> */}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </div>
            )}

            {translationHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenu
                          open={isTranslationDropdownOpen}
                          onOpenChange={setIsTranslationDropdownOpen}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button className="flex items-center px-3 py-2 font-medium rounded-md transition-colors bg-blue-50 hover:bg-blue-100 text-blue-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span>
                                {currentTranslationIndex >= 0
                                  ? translationHistory[
                                      currentTranslationIndex
                                    ].title.split("to")[1]
                                  : "Language"}
                              </span>
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 !rounded-md !p-2"
                          >
                            {translationHistory?.map(
                              (translation: TranslationItem, index: number) => (
                                <DropdownMenuItem
                                  key={index}
                                  className={`flex flex-col items-start p-3 hover:ring-0 hover:outline-0 hover:cursor-pointer hover:bg-gray-100 rounded-md ${
                                    currentTranslationIndex === index
                                      ? "bg-blue-50 border border-blue-200"
                                      : ""
                                  }`}
                                  onSelect={() =>
                                    handleApplyTranslation(translation, index)
                                  }
                                >
                                  <div className="flex w-full justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
                                        {translation.title.split("to")[1]}
                                      </span>
                                      {translation.lastModified &&
                                        !readOnlyValue && (
                                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                            Modified
                                          </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {currentTranslationIndex === index && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Available translations</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {saveUrl && !readOnlyValue && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSave}
                    className={`flex items-center px-3 border py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-md transition-colors ${
                      isSaving ? "animate-pulse bg-blue-100" : ""
                    }`}
                    disabled={isSaving}
                  >
                    <SaveIcon />
                    <span>Save</span>
                    {isSaving && (
                      <span className="ml-2 relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSaving ? "Saving..." : "Save document"}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {!readOnlyValue && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleOpenAIModal}
                    className={`flex items-center px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium rounded-md transition-colors ${
                      isGenerating ? "animate-pulse bg-purple-100" : ""
                    }`}
                    disabled={isGenerating}
                  >
                    <Sparkles className="tiptap-button !text-purple-500" />
                    <span>Generate</span>
                    {isGenerating && (
                      <span className="ml-2 relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isGenerating ? "Generating..." : "AI Generate content"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
