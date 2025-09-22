import React, { useState, useRef } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Copy, Check, Trash } from "lucide-react";
import "./CodeBlockComponent.scss";

const CodeBlockComponent = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
  deleteNode,
  // readOnlyValue = true,
}) => {
  const readOnlyValue = extension.options.readOnlyValue;
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const contentRef = useRef(null);

  const handleCopy = () => {
    if (codeRef.current) {
      const codeContent = (codeRef.current as HTMLElement).textContent || "";
      navigator.clipboard
        .writeText(codeContent)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      console.warn("Code content not found for copying.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab" && !readOnlyValue) {
      event.preventDefault();
      event.stopPropagation();

      // Insert tab character using document.execCommand for better compatibility
      try {
        if (document.queryCommandSupported("insertText")) {
          document.execCommand("insertText", false, "    "); // 4 spaces
        } else {
          // Fallback method
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const tabNode = document.createTextNode("    ");
            range.deleteContents();
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } catch (err) {
        console.error("Failed to insert tab: ", err);
      }
    }
  };

  const handleDelete = () => {
    if (deleteNode) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="code-block relative">
      <div className={`code-block-header ${readOnlyValue ? "!border-0" : ""}`}>
        {!readOnlyValue ? (
          <select
            className="code-block-language"
            contentEditable={false}
            defaultValue={defaultLanguage || "null"}
            onChange={(event) =>
              updateAttributes({ language: event.target.value })
            }
          >
            <option value="null">auto</option>
            <option disabled>—</option>
            {extension.options.lowlight.listLanguages().map((lang, index) => (
              <option key={index} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        ) : (
          <div className="code-block-language-display text-white uppercase">
            {defaultLanguage === null ? "auto" : defaultLanguage}
          </div>
        )}

        <div className="flex gap-2">
          {!readOnlyValue && (
            <button
              className="code-block-copy mr-5"
              onClick={handleDelete}
              aria-label="Delete code block"
              title="Delete code block"
            >
              <Trash size={18} />
            </button>
          )}
          {/* Copy button moved outside for sticky positioning */}
        </div>
      </div>

      {/* Sticky copy button for readOnly view */}
      {readOnlyValue && (
        <button
          className="code-block-copy left-[95%] mr-3 top-0 mt-[-32px]   sticky  z-10 bg-white"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      )}

      {/* Copy button in normal position for edit mode */}
      {!readOnlyValue && (
        <button
          className="code-block-copy absolute top-2.5 right-2"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      )}

      <pre className="code-block-pre relative">
        <code ref={codeRef} className="code-block-content">
          <NodeViewContent as="div" onKeyDown={handleKeyDown} />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
