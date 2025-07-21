import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Terminal } from "lucide-react";

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
  return (
    <NodeViewWrapper
      className={`output-block-wrapper ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
    >
      <div className="output-block-header">
        <div className="output-block-info ">
          <Terminal size={12} />
          <span>Output</span>
        </div>
      </div>
      <pre className="output-block-content">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default OutputBlockComponent;
