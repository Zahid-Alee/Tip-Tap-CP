import React, { useState, useContext } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Copy, Check } from "lucide-react";
import { EditorContext } from "@tiptap/react";

import "./codeBlockComponent.scss";

const CodeBlockComponent = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}) => {
  const [copied, setCopied] = useState(false);
  const { editor } = useContext(EditorContext) || {};
  const isReadOnly = editor?.isEditable === false;

  const handleCopy = () => {
    const codeContent =
      document.querySelector(".code-block-content")?.textContent || "";
    navigator.clipboard
      .writeText(codeContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <NodeViewWrapper className="code-block">
      <div className="code-block-header">
        {!isReadOnly && (
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
        )}
        {isReadOnly && (
          <div className="code-block-language-display">
            {defaultLanguage === "null" ? "auto" : defaultLanguage}
          </div>
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

      <pre className="code-block-pre relative">
        <button
          id="code-block-copy"
          className="code-block-copy ml-auto absolute top-2 right-2 hidden"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
        <NodeViewContent className="code-block-content" as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
