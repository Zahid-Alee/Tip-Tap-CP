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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";

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
  translationHistory,
  currentTranslationIndex,
  onTranslationChange,
  setIsUpdatingFromTranslation,
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] =
    React.useState(false);

  const [titleValue, setTitleValue] = React.useState(title);
  const [isEditTitle, setIsEditTitle] = React.useState(false);
  const handleOpenAIModal = () => {
    setIsAIModalOpen(true);
  };

  const handleSave = async () => {
    if (!editor || !saveUrl || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const content = editor.getHTML();

      const requestHeaders = {
        "Content-Type": "application/json",
        ...(headers || {}),
      };
      const response = await fetch(saveUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          content,
          translation: translationHistory,
          currentTranslationIndex: currentTranslationIndex,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSaveStatus({ type: "success", message: "Content saved successfully" });

      if (onSaveSuccess) {
        onSaveSuccess(data);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setSaveStatus({ type: "error", message: "Failed to save content" });

      if (onSaveError) {
        onSaveError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTranslation = (index) => {
    if (translationHistory[index]) {
      setIsUpdatingFromTranslation(true);
      editor.commands.setContent(translationHistory[index].text, false);
      onTranslationChange(index);
      setIsTranslationDropdownOpen(false);

      // Reset the flag after content is set
      setTimeout(() => setIsUpdatingFromTranslation(false), 100);
    }
  };

  return (
    <div
      className={`flex justify-between items-center p-3 ${
        !readOnlyValue && "border-b"
      } bg-inherit`}
    >
      <div className="editor-title">
        {!readOnlyValue && <h2 className="text-lg font-medium m-0">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
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
                          {translationHistory.map((translation, index) => (
                            <DropdownMenuItem
                              key={index}
                              className={`flex flex-col items-start p-3 hover:ring-0 hover:outline-0 hover:cursor-pointer hover:bg-gray-100 rounded-md ${
                                currentTranslationIndex === index
                                  ? "bg-blue-50 border border-blue-200"
                                  : ""
                              }`}
                              onSelect={() => handleApplyTranslation(index)}
                            >
                              <div className="flex w-full justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {translation.title.split("to")[1]}
                                  </span>
                                  {translation.lastModified && (
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
                          ))}
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
                <p>{isGenerating ? "Generating..." : "AI Generate content"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
