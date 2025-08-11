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
  FileJson,
  FileCode2,
  FileText,
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
  console.log("translationHistory", translationHistory);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] =
    React.useState(false);

  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importType, setImportType] = React.useState(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [titleValue, setTitleValue] = React.useState(title);
  const [isEditTitle, setIsEditTitle] = React.useState(false);
  const handleOpenAIModal = () => {
    setIsAIModalOpen(true);
  };

  // const getUpdatedSaveUrl = (customTitle) => {
  //   const splitedHeader = saveUrl.split("/");
  //   const newTitle = encodeURIComponent(customTitle || titleValue);
  //   let updatedHeaders = "";

  //   if (splitedHeader.length === 6 || splitedHeader.length === 7) {
  //     splitedHeader[5] = newTitle;
  //     updatedHeaders = splitedHeader.join("/");
  //   } else {
  //     updatedHeaders = saveUrl;
  //   }
  //   return updatedHeaders;
  // };

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
      console.log("here is the content for saving ", content);
      const response = await fetch(saveUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          title: titleValue,
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

  console.log("translatin hisotry", translationHistory);

  // UTILITIES ------------------------------------------------------------
  const triggerDownload = (filename, content, mime) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const jsonMarksToMarkdown = (textNode) => {
    if (!textNode || textNode.type !== "text") return "";
    let txt = textNode.text || "";
    if (textNode.marks) {
      textNode.marks.forEach((m) => {
        switch (m.type) {
          case "bold":
            txt = `**${txt}**`;
            break;
          case "italic":
            txt = `*${txt}*`;
            break;
          case "strike":
            txt = `~~${txt}~~`;
            break;
          case "code":
            txt = `\`${txt}\``;
            break;
          case "link":
            if (m.attrs?.href) txt = `[${txt}](${m.attrs.href})`;
            break;
        }
      });
    }
    return txt;
  };

  const nodeToMarkdown = (node, listContext = { ordered: false, index: 1 }) => {
    if (!node) return "";
    if (node.type === "text") return jsonMarksToMarkdown(node);
    const next = (children) =>
      (children || []).map((c) => nodeToMarkdown(c, listContext)).join("");
    switch (node.type) {
      case "paragraph":
        return `${next(node.content)}\n\n`;
      case "heading": {
        const level = node.attrs?.level || 1;
        return `${"#".repeat(level)} ${next(node.content)}\n\n`;
      }
      case "bulletList": {
        return (
          (node.content || [])
            .map((li) => nodeToMarkdown(li, { ordered: false, index: 1 }))
            .join("") + "\n"
        );
      }
      case "orderedList": {
        return (
          (node.content || [])
            .map((li, i) => nodeToMarkdown(li, { ordered: true, index: i + 1 }))
            .join("") + "\n"
        );
      }
      case "listItem": {
        const prefix = listContext.ordered ? `${listContext.index}. ` : `- `;
        // Gather paragraph(s) inside list item
        const body = (node.content || [])
          .map((c) => {
            if (c.type === "paragraph") {
              return next(c.content).trim();
            }
            return nodeToMarkdown(c, listContext).trim();
          })
          .join(" ");
        return `${prefix}${body}\n`;
      }
      case "blockquote":
        return (
          next(node.content)
            .split("\n")
            .map((l) => (l.trim() ? "> " + l : l))
            .join("\n") + "\n\n"
        );
      case "codeBlock": {
        const lang = node.attrs?.language || "";
        return `\n\n\`\`\`${lang}\n${next(node.content)}\n\`\`\`\n\n`;
      }
      case "horizontalRule":
        return `\n---\n\n`;
      case "image": {
        const alt = node.attrs?.alt || "";
        const src = node.attrs?.src || "";
        return `![${alt}](${src})\n\n`;
      }
      default:
        return next(node.content);
    }
  };

  const exportMarkdown = () => {
    try {
      const json = editor?.getJSON();
      if (!json) return;
      const md =
        (json.content || [])
          .map((n) => nodeToMarkdown(n))
          .join("")
          .replace(/\n{3,}/g, "\n\n")
          .trim() + "\n";
      triggerDownload(
        `${titleValue || "document"}.md`,
        md,
        "text/markdown;charset=utf-8"
      );
    } catch (e) {
      console.error("Markdown export failed", e);
    }
  };

  const handleExport = (type) => {
    if (!editor) return;
    switch (type) {
      case "html": {
        const html = editor.getHTML();
        triggerDownload(
          `${titleValue || "document"}.html`,
          html,
          "text/html;charset=utf-8"
        );
        break;
      }
      case "json": {
        const json = JSON.stringify(editor.getJSON(), null, 2);
        triggerDownload(
          `${titleValue || "document"}.json`,
          json,
          "application/json;charset=utf-8"
        );
        break;
      }
      case "markdown":
        exportMarkdown();
        break;
      default:
        break;
    }
    setIsExportOpen(false);
  };

  // Basic markdown -> HTML (very naive) for import.
  const simpleMarkdownToHTML = (md) => {
    try {
      const lines = md.replace(/\r/g, "").split(/\n/);
      let html = "";
      let inUl = false;
      let inOl = false;
      let inCode = false;
      lines.forEach((rawLine) => {
        let line = rawLine;
        if (/^```/.test(line)) {
          if (!inCode) {
            inCode = true;
            html += `<pre><code>`;
          } else {
            inCode = false;
            html += `</code></pre>`;
          }
          return;
        }
        if (inCode) {
          html += line.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
          return;
        }
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          html += `<h${level}>${headingMatch[2].trim()}</h${level}>`;
          return;
        }
        if (/^>\s?/.test(line)) {
          html += `<blockquote>${line
            .replace(/^>\s?/, "")
            .trim()}</blockquote>`;
          return;
        }
        const ulMatch = /^[-*]\s+/.test(line);
        const olMatch = /^\d+\.\s+/.test(line);
        if (ulMatch || olMatch) {
          if (ulMatch && !inUl) {
            if (inOl) {
              html += `</ol>`;
              inOl = false;
            }
            html += `<ul>`;
            inUl = true;
          }
          if (olMatch && !inOl) {
            if (inUl) {
              html += `</ul>`;
              inUl = false;
            }
            html += `<ol>`;
            inOl = true;
          }
          const item = line.replace(ulMatch ? /^[-*]\s+/ : /^\d+\.\s+/, "");
          html += `<li>${item}</li>`;
          return;
        } else {
          if (inUl) {
            html += `</ul>`;
            inUl = false;
          }
          if (inOl) {
            html += `</ol>`;
            inOl = false;
          }
        }
        if (!line.trim()) {
          return; // skip blank -> paragraph separation
        }
        // inline formatting
        line = line
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+?)`/g, "<code>$1</code>")
          .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
        html += `<p>${line}</p>`;
      });
      if (inUl) html += `</ul>`;
      if (inOl) html += `</ol>`;
      if (inCode) html += `</code></pre>`;
      return html;
    } catch (e) {
      console.error("Markdown parse failed", e);
      return md;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      try {
        if (typeof text !== "string") return;
        if (importType === "json") {
          const parsed = JSON.parse(text);
          console.log("[IMPORT:JSON] parsed", parsed);
          let docJSON: any = null;
          // Case 1: Direct doc JSON (has type: 'doc')
          if (parsed && parsed.type === "doc") {
            docJSON = parsed;
          }
          // Case 2: Wrapped object { doc: {...} }
          else if (parsed && parsed.doc && parsed.doc.type === "doc") {
            docJSON = parsed.doc;
          }
          // Case 2b: Wrapped inside data/doc e.g. { data: { doc: {...} } }
          else if (parsed?.data?.doc?.type === "doc") {
            docJSON = parsed.data.doc;
          }
          // Case 3: Server style { title, content } where content is HTML string
          else if (parsed && typeof parsed.content === "string") {
            editor.commands.setContent(parsed.content, false);
            return;
          }
          // Case 3b: { title, content: { type:'doc', ... } }
          else if (parsed?.content?.type === "doc") {
            docJSON = parsed.content;
          }
          // Case 4: Object with content array but missing type
          else if (parsed && Array.isArray(parsed.content)) {
            docJSON = { type: "doc", content: parsed.content };
          }
          // Case 5: Deeply nested maybe parsed.data.content
          else if (parsed?.data?.content?.type === "doc") {
            docJSON = parsed.data.content;
          } else if (
            parsed?.data?.content &&
            Array.isArray(parsed.data.content)
          ) {
            docJSON = { type: "doc", content: parsed.data.content };
          }

          if (docJSON) {
            // emitUpdate so dependent UI picks up new content
            editor.commands.setContent(docJSON);
          } else {
            console.warn(
              "[IMPORT:JSON] Unrecognized JSON shape, skipping",
              parsed
            );
          }
        } else if (importType === "html") {
          editor.commands.setContent(text);
        } else if (importType === "markdown") {
          const html = simpleMarkdownToHTML(text);
          editor.commands.setContent(html);
        }
      } catch (err) {
        console.error("Import failed", err);
      } finally {
        e.target.value = ""; // reset
        setImportType(null);
      }
    };
    reader.readAsText(file);
  };

  const startImport = (type) => {
    setImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        type === "json"
          ? "application/json,.json"
          : type === "html"
          ? "text/html,.html,.htm"
          : ".md,text/plain";
      fileInputRef.current.click();
    }
    setIsImportOpen(false);
  };

  // Using lucide-react icons now instead of inline SVGs.

  return (
    <div className="flex justify-between items-center p-3 border-b bg-inherit">
      <div className="editor-title flex items-center gap-4">
        {!readOnlyValue && (
          <div className="w-full">
            {isEditTitle && !readOnlyValue ? (
              <div className="bg-gray-50 flex w-full max-w-xl items-center gap-2 border border-gray-300 text-gray-900 px-2 rounded-lg overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-gray-400">
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
                  className="block py-2 w-full bg-transparent outline-none focus:outline-none"
                  placeholder="Enter title here"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditTitle(false)}
                  className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  <X size={16} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ) : (
              <h2 className="text-lg font-medium m-0">{titleValue}</h2>
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
                          {translationHistory?.map((translation, index) => (
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

          {/* {!readOnlyValue && ( */}
          <div className="flex items-center gap-2">
            {/* EXPORT MENU */}
            <DropdownMenu open={isExportOpen} onOpenChange={setIsExportOpen}>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-colors">
                  <Download className="h-4 w-4 mr-1" />
                  <span className="mr-1">Export</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 !rounded-md !p-2"
              >
                <DropdownMenuItem
                  onSelect={() => handleExport("html")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileCode2 className="h-4 w-4" />{" "}
                  <span className="text-sm">HTML</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleExport("json")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileJson className="h-4 w-4" />{" "}
                  <span className="text-sm">JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleExport("markdown")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />{" "}
                  <span className="text-sm">Markdown</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* IMPORT MENU */}
            <DropdownMenu open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition-colors">
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="mr-1">Import</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 !rounded-md !p-2"
              >
                <DropdownMenuItem
                  onSelect={() => startImport("html")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileCode2 className="h-4 w-4" />{" "}
                  <span className="text-sm">HTML (.html)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => startImport("json")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileJson className="h-4 w-4" />{" "}
                  <span className="text-sm">JSON (.json)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => startImport("markdown")}
                  className="flex gap-2 items-center cursor-pointer p-2 rounded hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />{" "}
                  <span className="text-sm">Markdown (.md)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </div>
          {/* )} */}
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
