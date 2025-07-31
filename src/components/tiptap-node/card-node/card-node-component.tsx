import React, { useState, useEffect, useRef, useCallback } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Settings, Palette } from "lucide-react";
import "./card-node.scss";

// Resize handle component
const ResizeHandle = ({ position, onMouseDown, className = "" }) => {
  return (
    <div
      className={`resize-handle ${position} ${className}`}
      onMouseDown={(e) => onMouseDown(e, position)}
    />
  );
};

interface CardNodeComponentProps {
  node: any;
  updateAttributes: (attributes: any) => void;
  selected: boolean;
  editor: any;
  getPos?: () => number;
}

export const CardNodeComponent: React.FC<CardNodeComponentProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
}) => {
  // Use a unique key for this card instance
  const cardKey = useRef(`card-${getPos ? getPos() : Math.random()}`);

  // Initialize settings state from sessionStorage if available
  const [showSettings, setShowSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`${cardKey.current}-settings`);
      return saved === "true";
    }
    return false;
  });

  // Add resize state
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || "auto",
    height: node.attrs.height || "auto",
  });
  const [isResizing, setIsResizing] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const showSettingsRef = useRef(showSettings);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update dimensions when node attributes change
  useEffect(() => {
    setDimensions({
      width: node.attrs.width || "auto",
      height: node.attrs.height || "auto",
    });
  }, [node.attrs.width, node.attrs.height]);

  // Persist settings state to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `${cardKey.current}-settings`,
        showSettings.toString()
      );
    }
    showSettingsRef.current = showSettings;
  }, [showSettings]);

  const {
    variant = "dark",
    backgroundColor,
    borderColor,
    textColor,
  } = node.attrs;

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettings]);

  // Close settings when card is no longer selected and clean up storage
  const prevSelectedRef = useRef(selected);
  useEffect(() => {
    // Only close settings if selection actually changed from true to false
    if (prevSelectedRef.current && !selected) {
      setShowSettings(false);
      // Clean up sessionStorage when card is deselected
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`${cardKey.current}-settings`);
      }
    }
    prevSelectedRef.current = selected;
  }, [selected]);

  const cardStyle = {
    backgroundColor: backgroundColor || undefined,
    borderColor: borderColor || undefined,
    color: textColor || undefined,
    width: dimensions.width === "auto" ? undefined : dimensions.width,
    height: dimensions.height === "auto" ? undefined : dimensions.height,
  };

  // Create CSS custom properties for better style application
  const cardStyleWithVars = {
    ...cardStyle,
    "--card-bg-color": backgroundColor || "",
    "--card-border-color": borderColor || "",
    "--card-text-color": textColor || "",
    "--card-width": dimensions.width || "auto",
    "--card-height": dimensions.height || "auto",
  } as React.CSSProperties;

  // Debug logging
  console.log("CardNode Debug:", {
    selected,
    showSettings,
    variant,
    backgroundColor,
    borderColor,
    textColor,
    dimensions,
    cardStyle: cardStyleWithVars,
  });

  return (
    <NodeViewWrapper
      className="card-node-wrapper"
      onClick={(e) => {
        // If clicking on the wrapper but not on content, select the card
        if (e.target === e.currentTarget && !selected) {
          e.preventDefault();
          e.stopPropagation();
          if (getPos) {
            const pos = getPos();
            editor.chain().focus().setNodeSelection(pos).run();
          } else {
            editor.chain().focus().run();
          }
        }
      }}
    >
      <div
        ref={cardRef}
        className={`tiptap-card tiptap-card--${variant} `}
        style={cardStyleWithVars}
        data-variant={variant}
      >
        <div className="tiptap-card-content">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default CardNodeComponent;
