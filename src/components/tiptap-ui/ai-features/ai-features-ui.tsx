import * as React from "react";
import { Editor } from "@tiptap/react";
import {
  Wand,
  Sparkles,
  Zap,
  BookMinus,
  Maximize,
  SpellCheck2,
  Mic,
  Check,
  LoaderCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover";
import Button from "../../tiptap-ui-primitive/button/button";

const TONES = {
  professional: "Professional",
  casual: "Casual",
  formal: "Formal",
  humorous: "Humorous",
  persuasive: "Persuasive",
} as const;

type ToneType = keyof typeof TONES;
type ActionType =
  | "improve"
  | "simplify"
  | "summarize"
  | "expand"
  | "translate"
  | "fix"
  | "change-tone";

const getSystemPrompt = (
  type: ActionType,
  options?: { language?: string; tone?: string }
): string => {
  // This base instruction is crucial for preserving structure.
  const baseInstruction = `You are an advanced writing assistant. Your task is to process the provided HTML content. You MUST strictly preserve all HTML tags, structure, and formatting (including attributes like class, style, etc.). Only modify the text content *between* the HTML tags according to the specific instruction below. Never add, remove, or alter any HTML tags or their attributes. Respond ONLY with the modified HTML content.`;

  switch (type) {
    case "improve":
      return `${baseInstruction} Specific Instruction: Improve the writing for clarity, flow, and impact while maintaining the original meaning. Enhance vocabulary and sentence structure where appropriate.`;
    case "simplify":
      return `${baseInstruction} Specific Instruction: Simplify the language to make it accessible to a broader audience (e.g., aim for a Grade 8 reading level) while maintaining technical accuracy. Use shorter sentences and common words where possible.`;
    case "summarize":
      return `${baseInstruction} Specific Instruction: Create a concise summary that captures the key points. Reduce the text length significantly (e.g., by 60-70%) while preserving all essential information. Maintain the original HTML structure as much as possible, summarizing the text within existing tags.`;
    case "expand":
      return `${baseInstruction} Specific Instruction: Expand this content significantly (aim for 2-3x longer) by adding relevant details, examples, explanations, or supporting information. Elaborate on key points while maintaining coherence and the original HTML structure.`;

    case "fix":
      return `${baseInstruction} Specific Instruction: Correct all spelling, grammar, punctuation, and syntax errors. Make only the minimal changes needed to fix issues while preserving the author's original voice and style.`;
    case "change-tone":
      return `${baseInstruction} Specific Instruction: Rewrite the text content to adopt a ${
        options?.tone || "specified"
      } tone. Adjust vocabulary, phrasing, and sentence structure accordingly, while preserving the core meaning and information.`;
    default:
      console.warn(`Unknown AI action type: ${type}`);
      return baseInstruction;
  }
};

async function callOpenAI(
  content: string,
  systemPrompt: string,
  action: ActionType
): Promise<string> {
  // const model = "gpt-4o-mini";
  let maxTokens = 1500;
  let temperature = 0.6;

  switch (action) {
    case "expand":
      maxTokens = 3000;
      temperature = 0.7;
      break;
    case "summarize":
      maxTokens = 1000;
      break;
    case "change-tone":
      temperature = 0.75;
      break;
    case "improve":
      temperature = 0.65;
      break;
  }

  const response = await fetch("/api/generate/text-lecture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      systemPrompt,
      userPrompt: content,
      totalTokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => response.text());
    console.error("OpenAI API Error:", response.status, errorBody);
    const errorMessage =
      errorBody?.error?.message ||
      `API request failed: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const resultText = data.content;

  if (!resultText) {
    console.error("Invalid response format from API:", data);
    throw new Error("Received an invalid or empty response from the AI.");
  }

  if (!resultText.trim().startsWith("<") || !resultText.trim().endsWith(">")) {
    console.warn("AI response might not be valid HTML:", resultText);
  }

  return resultText.trim();
}

interface AIFeaturesButtonProps {
  editor: Editor | null;
}

export const AIFeaturesButton: React.FC<AIFeaturesButtonProps> = ({
  editor,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeAction, setActiveAction] = React.useState<ActionType | null>(
    null
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const [selectedTone, setSelectedTone] =
    React.useState<ToneType>("professional");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!popoverOpen) {
      setError(null);
    }
  }, [popoverOpen]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

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

  if (!editor) return null;

  const getSelectedContent = (): string | null => {
    const { from, to, empty } = editor.state.selection;
    if (empty) return null;

    // Get the selected content as HTML
    const selectedContent =
      editor.view.dom.querySelector(".ProseMirror")?.innerHTML;
    if (!selectedContent) return null;

    return selectedContent;
  };

  const handleAI = async (
    action: ActionType,
    options?: { tone?: ToneType }
  ) => {
    if (!editor || isLoading) return;

    setIsLoading(true);
    setActiveAction(action);
    setError(null);

    try {
      // Check if there's selected text
      const selectedContent = getSelectedContent();
      const isSelectionOnly = !!selectedContent;

      let htmlToProcess: string;

      if (isSelectionOnly) {
        htmlToProcess = selectedContent;
      } else {
        htmlToProcess = editor.getHTML();
      }

      if (!htmlToProcess || htmlToProcess === "<p></p>") {
        throw new Error("Cannot process empty content.");
      }

      const systemPrompt = getSystemPrompt(action, {
        tone: options?.tone ? TONES[options.tone] : undefined,
      });

      const result = await callOpenAI(htmlToProcess, systemPrompt, action);

      // Apply the result based on whether we're working with selection or whole document
      if (isSelectionOnly) {
        // Replace only the selected content
        editor.commands.deleteSelection();
        editor.commands.insertContent(result);
      } else {
        // Replace the entire document
        editor.commands.setContent(result, false);
      }

      setPopoverOpen(false);
    } catch (err: any) {
      console.error(`AI Error (${action}):`, err);
      setError(
        `Failed to process '${action}': ${err.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const renderActionButton = (
    action: ActionType,
    IconComponent: React.ElementType,
    label: string,
    ariaLabel: string
  ) => {
    const isActive = isLoading && activeAction === action;

    return (
      <Button
        onClick={() => handleAI(action)}
        className={`w-full flex items-center justify-start px-3 py-2 text-sm text-left transition-colors rounded-md
                  ${
                    isLoading && !isActive
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
        disabled={isLoading}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {isActive ? (
          <LoaderCircle
            className="w-4 h-4 mr-2 animate-spin text-purple-600"
            aria-hidden="true"
          />
        ) : (
          <IconComponent
            className="w-4 h-4 mr-2 text-purple-600"
            aria-hidden="true"
          />
        )}
        <span>{label}</span>
      </Button>
    );
  };

  return (
    <div className="ai-feature-container">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`p-2 rounded-md  ${
              isLoading
                ? "bg-purple-100 text-purple-600"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            tooltip="AI Features"
            disabled={isLoading}
          >
            {isLoading ? (
              <Wand className="h-5 w-5 animate-pulse text-purple-600" />
            ) : (
              <Wand className="h-5 w-5 text-purple-600" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-64 p-0 flex flex-col rounded-lg shadow-lg border border-gray-200"
        >
          <div className="flex items-center w-full justify-between p-3 border-b border-gray-200">
            <h3 className="font-medium w-full text-purple-600">AI Assistant</h3>
          </div>

          {error && (
            <div className="p-3 mb-2 text-sm text-red-600 bg-red-50 border-l-4 border-red-500">
              {error}
              <Button
                onClick={() => setError(null)}
                className="mt-1 text-xs text-red-700 hover:text-red-800 underline"
                aria-label="Dismiss error"
              >
                Dismiss
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="px-3 py-2">
              <div className="flex justify-between mb-1 text-xs text-gray-600">
                <span>Processing {activeAction}...</span>
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

          <div className="p-2 flex flex-col gap-1">
            <p className="px-2 py-1 text-xs text-gray-500">
              {editor?.state.selection.empty
                ? "Actions will be applied to the entire text"
                : "Actions will be applied to selected text"}
            </p>

            {renderActionButton(
              "improve",
              Sparkles,
              "Improve Writing",
              "Improve writing clarity, flow, and impact"
            )}
            {renderActionButton(
              "fix",
              SpellCheck2,
              "Fix Grammar/Spelling",
              "Correct grammar and spelling errors"
            )}
            {renderActionButton(
              "simplify",
              Zap,
              "Simplify",
              "Simplify language complexity"
            )}
            {renderActionButton(
              "summarize",
              BookMinus,
              "Summarize",
              "Create a concise summary"
            )}
            {renderActionButton(
              "expand",
              Maximize,
              "Make Longer",
              "Expand content with more detail"
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isLoading}>
                <Button
                  className={`w-full flex items-center justify-start px-3 py-2 text-sm text-left transition-colors rounded-md
                            ${
                              isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                  aria-label="Change writing tone"
                  title="Change writing tone"
                >
                  <Mic
                    className="w-4 h-4 mr-2 text-purple-600"
                    aria-hidden="true"
                  />
                  <span>Change Tone</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 p-1 rounded-md shadow-lg border border-gray-200"
              >
                <div className="px-2 text-xs text-purple-500 font-medium py-1">
                  Select Tone
                </div>

                <hr className="py-1" />
                <DropdownMenuGroup>
                  {Object.entries(TONES).map(([code, name]) => {
                    const isActiveTone =
                      isLoading &&
                      activeAction === "change-tone" &&
                      selectedTone === code;

                    return (
                      <DropdownMenuItem
                        key={code}
                        className={`flex items-center w-full justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 text-gray-700`}
                        onSelect={() => {
                          setSelectedTone(code as ToneType);
                          handleAI("change-tone", { tone: code as ToneType });
                        }}
                        disabled={isLoading}
                      >
                        <span>{name}</span>
                        {isActiveTone ? (
                          <LoaderCircle className="w-4 h-4 ml-2 animate-spin text-purple-600" />
                        ) : selectedTone === code && !isLoading ? (
                          <Check className="w-4 h-4 ml-2 text-green-600" />
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
