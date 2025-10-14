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
    </NodeViewWrapper>
  );
};
