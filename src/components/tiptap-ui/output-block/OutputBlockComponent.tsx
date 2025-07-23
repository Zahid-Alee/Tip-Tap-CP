import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Terminal } from "lucide-react";
import "./styles.scss";

interface OutputBlockComponentProps {
  node: any;
  updateAttributes: (attributes: any) => void;
  selected: boolean;
}

const OutputBlockComponent: React.FC<OutputBlockComponentProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  // Preserve any existing data attributes and classes from the node
  const nodeAttrs = node.attrs || {};
  const preservedClasses = nodeAttrs.class || "output-block";
  const dataType = nodeAttrs["data-type"] || "output-block";
  const dataId = nodeAttrs["data-id"];
  const language = nodeAttrs.language || "text";

  return (
    <NodeViewWrapper
      className={`output-block-wrapper bg-gray-700 rounded-lg ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      data-type={dataType}
      data-language={language}
      {...(dataId && { "data-id": dataId })}
    >
      <div className="output-block-header !bg-gray-700 border-0 rounded-lg top-0 left-0 w-full absolute z-10">
        <div className="output-block-info ">
          <Terminal size={12} />
          <span className="text-gray-300">Output</span>
        </div>
      </div>
      <pre className={`output-block-content !m-0 ${preservedClasses}`}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default OutputBlockComponent;
