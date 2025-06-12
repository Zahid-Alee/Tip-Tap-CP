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
  Volume2,
  Pause,
  Play,
  VolumeX,
  Headphones,
  Speech,
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

// Audio visualizer component
const AudioVisualizer = ({ isPlaying }) => (
  <div className="flex items-center gap-0.5 ml-2">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={`w-0.5 bg-blue-500 rounded-full transition-all duration-200 ${
          isPlaying ? `h-3 animate-pulse` : "h-1"
        }`}
        style={{
          animationDelay: `${i * 0.15}s`,
          animationDuration: "0.6s",
        }}
      />
    ))}
  </div>
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
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] =
    React.useState(false);
  const [currentTranslationIndex, setCurrentTranslationIndex] =
    React.useState(-1);
  const [originalContent, setOriginalContent] = React.useState("");
  const [playingAudioIndex, setPlayingAudioIndex] = React.useState(null);
  const [audioElements, setAudioElements] = React.useState(new Map());
  const [audioProgress, setAudioProgress] = React.useState(new Map());

  React.useEffect(() => {
    if (editor && !originalContent && translationHistory.length > 0) {
      setOriginalContent(editor.getHTML());
    }
  }, [editor, originalContent, translationHistory]);

  // Cleanup audio elements on unmount
  React.useEffect(() => {
    return () => {
      audioElements.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const handleOpenAIModal = () => {
    console.log("true");
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
        body: JSON.stringify({ content, translation: translationHistory }),
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
      if (!originalContent) {
        setOriginalContent(editor.getHTML());
      }

      editor.commands.setContent(translationHistory[index].text, false);
      setCurrentTranslationIndex(index);
      setIsTranslationDropdownOpen(false);
    }
  };

  const handleAudioToggle = (index, audioUrl) => {
    // Stop any currently playing audio
    if (playingAudioIndex !== null && playingAudioIndex !== index) {
      const currentAudio = audioElements.get(playingAudioIndex);
      if (currentAudio) {
        currentAudio.pause();
      }
    }

    let audio = audioElements.get(index);

    if (!audio) {
      // Create new audio element
      audio = new Audio(audioUrl);

      // Add progress tracking
      audio.addEventListener("timeupdate", () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress((prev) => new Map(prev.set(index, progress)));
      });

      audio.addEventListener("ended", () => {
        setPlayingAudioIndex(null);
        setAudioProgress((prev) => new Map(prev.set(index, 0)));
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setPlayingAudioIndex(null);
      });

      setAudioElements((prev) => new Map(prev.set(index, audio)));
    }

    if (playingAudioIndex === index) {
      // Currently playing this audio, pause it
      audio.pause();
      setPlayingAudioIndex(null);
    } else {
      // Play this audio
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Audio play error:", error);
        setPlayingAudioIndex(null);
      });
      setPlayingAudioIndex(index);
    }
  };

  // Get current translation with audio
  const currentTranslationWithAudio =
    currentTranslationIndex >= 0
      ? translationHistory[currentTranslationIndex]
      : null;

  // Check if any translation has audio
  const hasAudioTranslations = translationHistory.some((t) => t.audio);

  return (
    <div className="flex justify-between items-center p-3 border-b bg-inherit">
      <div className="editor-title">
        {!readOnlyValue && <h2 className="text-lg font-medium m-0">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {translationHistory.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Translation Dropdown */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenu
                        open={isTranslationDropdownOpen}
                        onOpenChange={setIsTranslationDropdownOpen}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            className={`flex items-center px-3 py-2 font-medium rounded-md transition-colors ${
                              hasAudioTranslations
                                ? "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 border border-blue-200"
                                : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            <span>Language</span>
                            {hasAudioTranslations && (
                              <Headphones className="h-3 w-3 ml-1 text-purple-500" />
                            )}
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
                                  {translation.audio && (
                                    <div className="flex items-center gap-1">
                                      <Volume2 className="w-3 h-3 text-purple-500" />
                                      <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">
                                        Audio
                                      </span>
                                    </div>
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
                    <p>
                      {hasAudioTranslations
                        ? "Available translations with audio support"
                        : "Available translations"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Audio Player - Only show when a translation with audio is selected */}
              {currentTranslationWithAudio?.audio && (
                <div className="flex items-center gap-2 mx-3 border-purple-200 rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          handleAudioToggle(
                            currentTranslationIndex,
                            currentTranslationWithAudio.audio
                          )
                        }
                        className={`tiptap-button relative ${
                          playingAudioIndex === currentTranslationIndex
                            ? "!bg-purple-100"
                            : ""
                        }`}
                      >
                        {playingAudioIndex === currentTranslationIndex ? (
                          <>
                            <div className="w-2 h-2 absolute right-1 top-1 animate-ping rounded-full bg-purple-500"></div>

                            <Speech className="tiptap-button-icon !text-purple-600 relative" />
                          </>
                        ) : (
                          <Speech className="tiptap-button-icon" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {playingAudioIndex === currentTranslationIndex
                          ? "Pause audio"
                          : `Play ${
                              currentTranslationWithAudio.title.split("to")[1]
                            } audio`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
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
