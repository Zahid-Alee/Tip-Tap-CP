import React, { useState, useEffect, useRef, useCallback } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Settings, Palette, X, Trash } from "lucide-react";
import "./card-node.scss";

interface CardNodeComponentProps {
  node: any;
  updateAttributes: (attributes: any) => void;
  selected: boolean;
  editor: any;
  getPos?: () => number;
}

type ResizeHandle = "n" | "e" | "s" | "w" | "ne" | "se" | "sw" | "nw";

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

  // Add resize state with default dimensions
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 300,
    height: node.attrs.height || 200,
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStartData, setResizeStartData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const showSettingsRef = useRef(showSettings);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions when node attributes change
  useEffect(() => {
    setDimensions({
      width: node.attrs.width || 300,
      height: node.attrs.height || 200,
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
    borderRadius,
    backgroundImage,
    overlayColor,
    overlayOpacity,
    textAlignment = "left",
    verticalAlignment = "top",
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
    if (prevSelectedRef.current && !selected) {
      setShowSettings(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`${cardKey.current}-settings`);
      }
    }
    prevSelectedRef.current = selected;
  }, [selected]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      // Don't allow resize in read-only mode
      if (!editor?.isEditable) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStartData({
        startX: e.clientX,
        startY: e.clientY,
        startWidth: dimensions.width,
        startHeight: dimensions.height,
      });
    },
    [dimensions, editor]
  );

  // Handle resize during mouse move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeStartData || !resizeHandle) return;

      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;

      let newWidth = resizeStartData.startWidth;
      let newHeight = resizeStartData.startHeight;

      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case "e":
          newWidth = resizeStartData.startWidth + deltaX;
          break;
        case "w":
          newWidth = resizeStartData.startWidth - deltaX;
          break;
        case "s":
          newHeight = resizeStartData.startHeight + deltaY;
          break;
        case "n":
          newHeight = resizeStartData.startHeight - deltaY;
          break;
        case "se":
          newWidth = resizeStartData.startWidth + deltaX;
          newHeight = resizeStartData.startHeight + deltaY;
          break;
        case "sw":
          newWidth = resizeStartData.startWidth - deltaX;
          newHeight = resizeStartData.startHeight + deltaY;
          break;
        case "ne":
          newWidth = resizeStartData.startWidth + deltaX;
          newHeight = resizeStartData.startHeight - deltaY;
          break;
        case "nw":
          newWidth = resizeStartData.startWidth - deltaX;
          newHeight = resizeStartData.startHeight - deltaY;
          break;
      }

      // Apply constraints
      newWidth = Math.max(200, Math.min(1200, newWidth)); // Max width 1200px
      newHeight = Math.max(100, Math.min(newHeight));

      setDimensions({ width: newWidth, height: newHeight });
    },
    [isResizing, resizeStartData, resizeHandle]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartData(null);

    // Update the node attributes to persist the size
    updateAttributes({
      width: dimensions.width,
      height: dimensions.height,
    });
  }, [isResizing, dimensions, updateAttributes]);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      document.body.style.userSelect = "none";
      document.body.style.cursor = getCursorForHandle(resizeHandle);

      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd, resizeHandle]);

  // Helper function to get cursor style for resize handle
  const getCursorForHandle = (handle: ResizeHandle | null): string => {
    switch (handle) {
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "nw":
      case "se":
        return "nwse-resize";
      default:
        return "default";
    }
  };

  const cardStyle = {
    backgroundColor: backgroundColor || undefined,
    borderColor: borderColor || undefined,
    color: textColor || undefined,
    borderRadius: borderRadius || undefined,
    ...(backgroundImage && {
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }),
  };

  // Create CSS custom properties for better style application
  const cardStyleWithVars = {
    ...cardStyle,
    "--card-bg-color": backgroundColor || "",
    "--card-border-color": borderColor || "",
    "--card-text-color": textColor || "",
    "--card-border-radius": borderRadius || "",
    "--card-bg-image": backgroundImage || "",
    "--card-overlay-color": overlayColor || "",
    "--card-overlay-opacity": overlayOpacity || "0.5",
    "--card-text-alignment": textAlignment || "left",
    "--card-vertical-alignment": verticalAlignment || "top",
  } as React.CSSProperties;

  // Render resize handles
  const renderResizeHandles = () => {
    // Don't show resize handles in read-only mode
    if (!editor?.isEditable) return null;
    if (!selected && !isHovered) return null;

    const handleStyle = {
      position: "absolute" as const,
      backgroundColor: "#3b82f6",
      zIndex: 10,
      transition: "opacity 0.2s ease-in-out",
    };

    const lineHandleStyle = {
      ...handleStyle,
      opacity: 0.7,
    };

    const cornerHandleStyle = {
      ...handleStyle,
      width: "8px",
      height: "8px",
      borderRadius: "50%",
    };

    return (
      <>
        {/* Corner handles */}
        <div
          style={{
            ...cornerHandleStyle,
            top: "-4px",
            left: "-4px",
            cursor: "nw-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "nw")}
        />
        <div
          style={{
            ...cornerHandleStyle,
            top: "-4px",
            right: "-4px",
            cursor: "ne-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "ne")}
        />
        <div
          style={{
            ...cornerHandleStyle,
            bottom: "-4px",
            left: "-4px",
            cursor: "sw-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "sw")}
        />
        <div
          style={{
            ...cornerHandleStyle,
            bottom: "-4px",
            right: "-4px",
            cursor: "se-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "se")}
        />

        {/* Edge handles */}
        <div
          style={{
            ...lineHandleStyle,
            top: "-2px",
            left: "8px",
            right: "8px",
            height: "4px",
            cursor: "ns-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "n")}
        />
        <div
          style={{
            ...lineHandleStyle,
            bottom: "-2px",
            left: "8px",
            right: "8px",
            height: "4px",
            cursor: "ns-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "s")}
        />
        <div
          style={{
            ...lineHandleStyle,
            left: "-2px",
            top: "8px",
            bottom: "8px",
            width: "4px",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "w")}
        />
        <div
          style={{
            ...lineHandleStyle,
            right: "-2px",
            top: "8px",
            bottom: "8px",
            width: "4px",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleResizeStart(e, "e")}
        />
      </>
    );
  };

  // Add delete handler
  const handleDelete = useCallback(() => {
    if (getPos && editor?.isEditable) {
      const pos = getPos();
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
  }, [getPos, editor, node.nodeSize]);

  // Render delete button

  return (
    <NodeViewWrapper
      className="card-node-wrapper"
      onClick={(e) => {
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
        ref={containerRef}
        className="card-resizable-container"
        style={{
          position: "relative",
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          display: "inline-block",
        }}
        onMouseEnter={() => editor?.isEditable && setIsHovered(true)}
        onMouseLeave={() => editor?.isEditable && setIsHovered(false)}
      >
        <div
          ref={cardRef}
          className={`tiptap-card tiptap-card--${variant}`}
          style={{
            ...cardStyleWithVars,
            width: "100%",
            height: "100%",
          }}
          data-variant={variant}
          data-text-alignment={textAlignment}
          data-vertical-alignment={verticalAlignment}
        >
          {/* Background overlay */}
          {backgroundImage && overlayColor && (
            <div
              className="card-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: overlayColor,
                opacity: overlayOpacity || 0.5,
                pointerEvents: "none",
                borderRadius: "inherit",
                zIndex: 1,
              }}
            />
          )}
          <div
            className="tiptap-card-content"
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              minHeight: "inherit",
            }}
          >
            <NodeViewContent />
          </div>
        </div>
        {renderResizeHandles()}
      </div>
    </NodeViewWrapper>
  );
};

export default CardNodeComponent;
