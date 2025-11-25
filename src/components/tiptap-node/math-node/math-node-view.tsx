import React, { useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./math-node.scss";

export const MathNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex || "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const isBlock = node.attrs.isBlock;
  const isEditable = editor?.isEditable;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const renderFormula = () => {
    if (!latex.trim()) return null;

    try {
      const html = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: isBlock,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err: any) {
      return <span className="math-error">Invalid formula</span>;
    }
  };

  const handleEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (latex.trim() === "") {
      deleteNode();
      return;
    }

    try {
      katex.renderToString(latex, { throwOnError: true });
      updateAttributes({ latex });
      setIsEditing(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Invalid LaTeX");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setLatex(node.attrs.latex);
      setIsEditing(false);
      setError("");
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper
        as="span"
        className={`math-formula-editor ${
          isBlock ? "math-block" : "math-inline"
        }`}
        contentEditable={false}
      >
        <input
          ref={inputRef}
          type="text"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder="Enter LaTeX formula..."
          className="math-input"
        />
        {error && <span className="math-error-tooltip">{error}</span>}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as={isBlock ? "div" : "span"}
      className={`math-formula-wrapper ${
        isBlock ? "math-block" : "math-inline"
      } ${isEditable ? "editable" : "read-only"}`}
      contentEditable={false}
      onClick={handleEdit}
      ref={containerRef}
    >
      {renderFormula()}

      <style jsx>{`
        .math-formula-wrapper {
          display: inline-block;
          padding: 2px 6px;
          margin: 0 2px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          vertical-align: middle;
        }

        .math-formula-wrapper.editable:hover {
          background-color: #e9ecef;
          border-color: #7c3aed;
        }

        .math-formula-wrapper.read-only {
          cursor: default;
          background-color: transparent;
          border-color: transparent;
          padding: 2px 0;
        }

        .math-formula-wrapper.read-only:hover {
          background-color: transparent;
          border-color: transparent;
        }

        .math-formula-wrapper.math-block {
          display: block;
          text-align: center;
          padding: 16px;
          margin: 16px 0;
          background-color: #fafbfc;
        }

        .math-formula-wrapper.math-block.read-only {
          background-color: transparent;
          padding: 16px 0;
        }

        .math-formula-wrapper .katex {
          font-size: 1.1em;
        }

        .math-error {
          color: #dc2626;
          font-size: 0.875rem;
          font-style: italic;
        }
      `}</style>
    </NodeViewWrapper>
  );
};
