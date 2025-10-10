import * as React from "react";
import {
  Languages,
  LoaderCircle,
  ChevronDown,
  Check,
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover";
import { LANGUAGES, TRANSLATION_SERVICES } from "../../../lib/tiptap-utils";
import axios from "axios";
import Button from "../../tiptap-ui-primitive/button/button";

export const TranslationModule = ({
  editor,
  setTranslationHistory,
  translationHistory,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = React.useState("ES");
  const [progress, setProgress] = React.useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState(false);
  const [translationService, setTranslationService] = React.useState("deepl");
  const [activeTab, setActiveTab] = React.useState("translation");

  // Audio states
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [audioProgress, setAudioProgress] = React.useState(0);
  const [playingAudio, setPlayingAudio] = React.useState(null);
  const [audioRefs, setAudioRefs] = React.useState({});

  const [originalContent, setOriginalContent] = React.useState("");
  const [isTranslated, setIsTranslated] = React.useState(false);
  const [currentTranslationIndex, setCurrentTranslationIndex] =
    React.useState(-1);

  React.useEffect(() => {
    if (!isPopoverOpen) {
      setError(null);
      setSearchQuery("");
    }
  }, [isPopoverOpen]);

  // Progress bar animation
  React.useEffect(() => {
    let interval;

    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = (100 - prev) * 0.1;
          return Math.min(prev + increment, 95);
        });
      }, 300);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  // Audio progress animation
  React.useEffect(() => {
    let interval;

    if (isGeneratingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          const increment = (100 - prev) * 0.08;
          return Math.min(prev + increment, 90);
        });
      }, 400);
    } else {
      setAudioProgress(0);
    }

    return () => clearInterval(interval);
  }, [isGeneratingAudio]);

  React.useEffect(() => {
    if (editor && !originalContent) {
      setOriginalContent(editor.getHTML());
    }
  }, [editor, originalContent]);

  if (!editor) return null;

  // Filter languages based on search query
  const filteredLanguages = LANGUAGES.filter((lang) => {
    const query = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(query) ||
      (lang.localName && lang.localName.toLowerCase().includes(query)) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  const getLanguageName = (code) => {
    const language = LANGUAGES.find((lang) => lang.code === code);
    return language ? language.name : code;
  };

  const isLanguageTranslated = (code) => {
    return translationHistory.some((item) => item.targetLanguage === code);
  };

  const getExistingTranslationIndex = (code) => {
    return translationHistory.findIndex((item) => item.targetLanguage === code);
  };

  const saveToHistory = (
    htmlContent,
    langCode,
    detectedSourceLang,
    service,
    audioUrl = null
  ) => {
    const sourceLangName = getLanguageName(detectedSourceLang || "EN");
    const targetLangName = getLanguageName(langCode);

    const newTranslation = {
      title: `${sourceLangName} to ${targetLangName}`,
      text: htmlContent,
      sourceLanguage: detectedSourceLang || "EN",
      targetLanguage: langCode,
      service: service,
      timestamp: new Date().toISOString(),
      audio: audioUrl,
    };

    console.log("newTranslation", newTranslation);

    // Check if translation for this language already exists
    const existingIndex = getExistingTranslationIndex(langCode);

    console.log("existingIndex", existingIndex);

    if (existingIndex >= 0) {
      console.log("exiiting", existingIndex);
      // Replace existing translation, preserving audio if it exists
      // setTranslationHistory((prev) =>
      //   prev.map((item, index) =>
      //     index === existingIndex
      //       ? { ...newTranslation, audio: item.audio || audioUrl }
      //       : item
      //   )
      // );
      const updatedHistory = translationHistory.map((item, index) =>
        index === existingIndex
          ? { ...newTranslation, audio: item.audio || audioUrl }
          : item
      );
      setTranslationHistory(updatedHistory);
      setCurrentTranslationIndex(existingIndex);
    } else {
      // Add new translation
      // setTranslationHistory((prev) => [...prev, newTranslation]);
      const newHistory = [...translationHistory, newTranslation];
      setTranslationHistory(newHistory);
      setCurrentTranslationIndex(newHistory.length - 1);
      setCurrentTranslationIndex(translationHistory.length);
    }
  };

  const updateTranslationWithAudio = (index, audioUrl) => {
    console.log("Updating translation with audio:", index, audioUrl);
    const updatedHistory = translationHistory.map((item, i) =>
      i === index ? { ...item, audio: audioUrl } : item
    );
    setTranslationHistory(updatedHistory);
  };

  const generateAudio = async (text, translationIndex) => {
    setIsGeneratingAudio(true);
    setError(null);

    try {
      const textContent = text.replace(/<[^>]*>/g, "").trim();

      if (!textContent) {
        throw new Error("No text content found for audio generation.");
      }

      const response = await axios.post("/api/gen/text-to-speech", {
        text: textContent,
        voice: "alloy",
        path: "/app/course/1000/narrations",
      });

      if (!response.data.success) {
        throw new Error(`Audio generation failed`);
      }
      // console.log("data", response.data);
      const data = response.data;
      updateTranslationWithAudio(translationIndex, data?.data);
    } catch (err) {
      console.error("Audio Generation Error:", err);
      setError(`Audio generation failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayAudio = (audioUrl, index) => {
    // Stop any currently playing audio
    Object.values(audioRefs).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (playingAudio === index) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    setAudioRefs((prev) => ({ ...prev, [index]: audio }));

    audio.addEventListener("ended", () => {
      setPlayingAudio(null);
    });

    audio.addEventListener("error", () => {
      setError("Failed to play audio");
      setPlayingAudio(null);
    });

    audio.play();
    setPlayingAudio(index);
  };

  const handleTranslate = async () => {
    if (!editor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!isTranslated && !originalContent) {
        setOriginalContent(editor.getHTML());
      }

      const htmlContent = editor.getHTML();

      if (!htmlContent || htmlContent === "<p></p>") {
        throw new Error("Cannot translate empty content.");
      }

      const endpoint =
        translationService === "deepl"
          ? "/api/translate/deepl"
          : "/api/translate/chatgpt";

      const payload =
        translationService === "deepl"
          ? {
              text: htmlContent,
              target_lang: targetLanguage,
              tag_handling: "html",
            }
          : {
              text: htmlContent,
              target_lang: targetLanguage,
              preserve_formatting: true,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      let translatedContent;
      let detectedSourceLang = "EN";

      // console.log("data from translate api", data);

      if (
        data.success &&
        data.data &&
        data?.data?.translations &&
        data?.data?.translations?.length > 0
      ) {
        translatedContent = data.data?.translations[0]?.text;
        detectedSourceLang =
          data.data?.translations[0]?.detected_source_language;

        console.log("translated content", translatedContent);
        console.log("data souce lang", detectedSourceLang);
      } else {
        throw new Error("Invalid response format from translation service");
      }

      if (translationHistory?.length < 1) {
        saveToHistory(editor.getHTML(), "English", "English", "English");
      }

      saveToHistory(
        translatedContent,
        targetLanguage,
        detectedSourceLang,
        translationService
      );

      setIsTranslated(true);
      setIsPopoverOpen(false);
    } catch (err) {
      console.error("Translation Error:", err);
      setError(`Translation failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    if (originalContent) {
      editor.commands.setContent(originalContent, false);
      setCurrentLanguage(null);
    }
  };

  const hasTranslations = translationHistory.length > 0;

  const removeTranslation = (index: number) => {
    const updatedHistory = translationHistory.filter((_, i) => i !== index);
    setTranslationHistory(updatedHistory);

    // If we're removing the currently active translation
    if (index === currentTranslationIndex) {
      // Check if there's an English translation (original content)
      const englishIndex = updatedHistory.findIndex(
        (item) =>
          item.targetLanguage === "English" || item.targetLanguage === "EN"
      );

      if (englishIndex >= 0) {
        // Restore to English translation
        editor.commands.setContent(updatedHistory[englishIndex].text, false);
        setCurrentTranslationIndex(englishIndex);
        setCurrentLanguage(updatedHistory[englishIndex].targetLanguage);
      } else if (originalContent) {
        // Fallback to original content if no English translation exists
        editor.commands.setContent(originalContent, false);
        setCurrentTranslationIndex(-1);
        setCurrentLanguage(null);
        setIsTranslated(false);
      }
    } else if (index < currentTranslationIndex) {
      // Adjust the current index if a translation before it was removed
      setCurrentTranslationIndex(currentTranslationIndex - 1);
    }

    // Stop any playing audio from the removed translation
    if (playingAudio === index) {
      const audio = audioRefs[index];
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);

      // Clean up audio ref
      setAudioRefs((prev) => {
        const { [index]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <div className="relative">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`p-2 rounded-md ${
              isLoading
                ? "bg-purple-100 text-purple-600"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            tooltip="Translate Document"
            disabled={isLoading && !isPopoverOpen}
          >
            {isLoading ? (
              <Languages className="h-5 w-5 text-purple-600 animate-pulse" />
            ) : (
              <Languages className="h-5 w-5 text-purple-600" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-96 !p-0 flex flex-col rounded-lg shadow-lg border border-gray-200"
        >
          <div className="flex items-center w-full justify-between p-3 border-b border-gray-200 rounded-t-lg">
            <h3 className="font-medium text-purple-600">
              Translation & Narrations
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "translation"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("translation")}
            >
              Translation
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "narration"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              } ${!hasTranslations ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => hasTranslations && setActiveTab("narration")}
              disabled={!hasTranslations}
            >
              Narration
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-l-4 border-red-500">
              {error}
            </div>
          )}

          <div className="p-3">
            {activeTab === "translation" && (
              <>
                {isLoading && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1 text-xs text-gray-600">
                      <span>
                        Translating to {getLanguageName(targetLanguage)}...
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Translation Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Translation Service
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TRANSLATION_SERVICES.map((service) => (
                        <button
                          key={service.id}
                          className={`px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center transition-colors ${
                            translationService === service.id
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                          onClick={() => setTranslationService(service.id)}
                          disabled={isLoading}
                        >
                          {service.name}
                          {translationService === service.id && (
                            <Check className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Translate to
                    </label>
                    <DropdownMenu
                      open={isDropdownOpen}
                      onOpenChange={setIsDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild disabled={isLoading}>
                        <Button className="w-full flex items-center justify-between px-3 py-2 text-sm text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                          <span className="w-full">
                            {getLanguageName(targetLanguage)}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="max-w-xs w-full !rounded-md"
                        align="start"
                      >
                        <div
                          className="px-3 py-2 border-b border-gray-200"
                          onKeyDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder="Search languages..."
                              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        <div className="py-1 flex flex-col overflow-y-scroll max-h-80">
                          {filteredLanguages.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100"
                              onSelect={() => {
                                setTargetLanguage(lang.code);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800">
                                  {lang.name}
                                  {isLanguageTranslated(lang.code) && (
                                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                      Translated
                                    </span>
                                  )}
                                </span>
                                {lang.localName &&
                                  lang.localName !== lang.name && (
                                    <span className="text-xs text-gray-500">
                                      {lang.localName}
                                    </span>
                                  )}
                              </div>
                              {targetLanguage === lang.code && (
                                <Check className="w-4 h-4 text-purple-600" />
                              )}
                            </DropdownMenuItem>
                          ))}

                          {filteredLanguages.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                              No languages found
                            </div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleTranslate}
                      disabled={isLoading}
                      className="w-full py-2 px-4 !bg-purple-600 !hover:bg-purple-700 !text-white !text-sm font-medium !rounded-md flex !items-center !justify-center !transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : isLanguageTranslated(targetLanguage) ? (
                        "Retranslate"
                      ) : (
                        "Translate"
                      )}
                    </Button>

                    {currentLanguage && (
                      <Button
                        onClick={handleRestore}
                        className="w-full py-1 px-3 !bg-gray-100 !hover:bg-gray-200 !text-gray-700 !text-sm !rounded-md flex !items-center !justify-center !transition-colors"
                      >
                        Restore Original
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Translates your entire document while preserving HTML
                    structure using{" "}
                    {translationService === "deepl" ? "DeepL" : "ChatGPT"}.
                  </p>
                </div>
              </>
            )}

            {activeTab === "narration" && (
              <div className="space-y-4">
                {isGeneratingAudio && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1 text-xs text-gray-600">
                      <span>Generating audio...</span>
                      <span>{Math.round(audioProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {translationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <VolumeX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No translations available for audio generation.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Create translations first to generate narration.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Generated Translations
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {translationHistory?.map((translation, index) => (
                        <div
                          key={index}
                          className="p-3 border border-gray-200 rounded-md bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {translation?.title?.split("to")[1]}
                            </span>
                            <div className="flex gap-2 items-center">
                              {translation.audio ? (
                                <span className="text-xs text-gray-500">
                                  Narration
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  {translation.service}
                                </span>
                              )}
                              <button
                                className=" text-red-500 text-xs text-red-500"
                                onClick={() => removeTranslation(index)}
                                title="Remove this translation"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {translation.audio ? (
                              <Button
                                onClick={() =>
                                  handlePlayAudio(translation.audio, index)
                                }
                                className="!p-2 !bg-green-100 !hover:bg-green-200 !text-green-700 !rounded-md"
                                disabled={isGeneratingAudio}
                              >
                                {playingAudio === index ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() =>
                                  generateAudio(translation.text, index)
                                }
                                disabled={isGeneratingAudio}
                                className="!p-2 !bg-blue-100 !hover:bg-blue-200 !text-blue-700 !rounded-md"
                              >
                                Generate Narration
                              </Button>
                            )}

                            {translation.audio && (
                              <Button
                                onClick={() =>
                                  generateAudio(translation.text, index)
                                }
                                disabled={isGeneratingAudio}
                                className="!p-2 !bg-gray-100 !hover:bg-gray-200 !text-gray-600 !rounded-md"
                                title="Regenerate audio"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}

                            <span className="text-xs text-gray-500 flex-1 truncate">
                              {translation.audio
                                ? "Audio ready"
                                : "Generate audio"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  Generate audio narration for your translations using
                  text-to-speech.
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {translationHistory.length > 0 && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {translationHistory.length}
          </div>
        </div>
      )}
    </div>
  );
};
