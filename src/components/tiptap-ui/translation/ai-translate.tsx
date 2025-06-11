import * as React from "react";
import {
  Languages,
  LoaderCircle,
  ChevronDown,
  Check,
  Search,
  Settings2,
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
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tiptap-ui-primitive/tabs";

const LANGUAGES = [
  { code: "BG", name: "Bulgarian", localName: "български" },
  { code: "CS", name: "Czech", localName: "Čeština" },
  { code: "DA", name: "Danish", localName: "Dansk" },
  { code: "DE", name: "German", localName: "Deutsch" },
  { code: "EL", name: "Greek", localName: "Ελληνικά" },
  { code: "EN-GB", name: "English (British)", localName: "English (British)" },
  {
    code: "EN-US",
    name: "English (American)",
    localName: "English (American)",
  },
  { code: "ES", name: "Spanish", localName: "Español" },
  { code: "ET", name: "Estonian", localName: "Eesti" },
  { code: "FI", name: "Finnish", localName: "Suomi" },
  { code: "FR", name: "French", localName: "Français" },
  { code: "HU", name: "Hungarian", localName: "Magyar" },
  { code: "ID", name: "Indonesian", localName: "Bahasa Indonesia" },
  { code: "IT", name: "Italian", localName: "Italiano" },
  { code: "JA", name: "Japanese", localName: "日本語" },
  { code: "KO", name: "Korean", localName: "한국어" },
  { code: "LT", name: "Lithuanian", localName: "Lietuvių" },
  { code: "LV", name: "Latvian", localName: "Latviešu" },
  { code: "NB", name: "Norwegian", localName: "Norsk" },
  { code: "NL", name: "Dutch", localName: "Nederlands" },
  { code: "PL", name: "Polish", localName: "Polski" },
  {
    code: "PT-BR",
    name: "Portuguese (Brazilian)",
    localName: "Português (Brasil)",
  },
  {
    code: "PT-PT",
    name: "Portuguese (European)",
    localName: "Português (Portugal)",
  },
  { code: "RO", name: "Romanian", localName: "Română" },
  { code: "RU", name: "Russian", localName: "Русский" },
  { code: "SK", name: "Slovak", localName: "Slovenčina" },
  { code: "SL", name: "Slovenian", localName: "Slovenščina" },
  { code: "SV", name: "Swedish", localName: "Svenska" },
  { code: "TR", name: "Turkish", localName: "Türkçe" },
  { code: "UK", name: "Ukrainian", localName: "Українська" },
  { code: "ZH", name: "Chinese (simplified)", localName: "中文 (简体)" },
];

// Translation service options
const TRANSLATION_SERVICES = [
  { id: "deepl", name: "DeepL" },
  { id: "chatgpt", name: "ChatGPT" },
];

export const TranslationModule = ({
  editor,
  setTranslationHistory,
  translationHistory,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [error, setError] = React.useState(null);
  const [targetLanguage, setTargetLanguage] = React.useState("ES");
  const [progress, setProgress] = React.useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState(false);
  const [translationService, setTranslationService] = React.useState("deepl");

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

  const saveToHistory = (
    htmlContent,
    langCode,
    detectedSourceLang,
    service
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
    };

    setTranslationHistory((prev) => [...prev, newTranslation]);
    setCurrentTranslationIndex((prev) => prev + 1);
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
          ? "http://lms.localhost:8000/api/translate/deepl"
          : "http://lms.localhost:8000/api/translate/chatgpt";

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

      if (
        data.success &&
        data.data &&
        data.data.translations &&
        data.data.translations.length > 0
      ) {
        translatedContent = data.data.translations[0].text;
        detectedSourceLang = data.data.translations[0].detected_source_language;
      } else {
        throw new Error(
          "Invalid response format from DeepL translation service"
        );
      }

      if (translationHistory?.length < 1) {
        saveToHistory(editor.getHTML(), "Engilsh", "English", "original");
      }

      editor.commands.setContent(translatedContent, false);
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
            title="Translate Document"
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
          className="w-80 !p-0 flex flex-col rounded-lg shadow-lg border border-gray-200"
        >
          <div className="flex items-center w-full justify-between p-3 border-b border-gray-200 rounded-t-lg">
            <h3 className="font-medium text-purple-600">Translate Document</h3>
          </div>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-l-4 border-red-500">
              {error}
            </div>
          )}

          <div className="p-3">
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
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search languages..."
                          className="w-full pl-9 py-1 text-sm"
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
                            {lang.localName && lang.localName !== lang.name && (
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
                Translates your entire document while preserving HTML structure
                using {translationService === "deepl" ? "DeepL" : "ChatGPT"}.
              </p>
            </div>
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
