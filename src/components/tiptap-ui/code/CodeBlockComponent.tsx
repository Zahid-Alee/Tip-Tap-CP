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

  const handleCopy = () => {
    if (codeRef.current) {
      const codeContent = codeRef.current.textContent || "";
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

  const handleDelete = () => {
    if (deleteNode) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="code-block">
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
              className="code-block-copy"
              onClick={handleDelete}
              aria-label="Delete code block"
              title="Delete code block"
            >
              <Trash size={18} />
            </button>
          )}
          <button
            className="code-block-copy"
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy code"}
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <pre className="code-block-pre relative">
        <code ref={codeRef} className="code-block-content">
          <NodeViewContent as="div" />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
