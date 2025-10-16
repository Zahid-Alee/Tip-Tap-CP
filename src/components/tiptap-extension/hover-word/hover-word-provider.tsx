import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import HoverWordCard from "./hover-word-card";

interface HoverWordProviderProps {
  editor: Editor | null;
}

export const HoverWordProvider: React.FC<HoverWordProviderProps> = ({
  editor,
}) => {
  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    title?: string;
    description?: string;
    metadata?: string;
    element: HTMLElement;
  } | null>(null);

  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    let hoverTimeout: NodeJS.Timeout;

    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the target or any parent has the hover-word class
      const hoverWordElement = target.closest(".hover-word") as HTMLElement;

      if (hoverWordElement) {
        // Add delay to prevent immediate popup
        hoverTimeout = setTimeout(() => {
          const word = hoverWordElement.getAttribute("data-word");
          const title = hoverWordElement.getAttribute("data-title");
          const description = hoverWordElement.getAttribute("data-description");
          const metadata = hoverWordElement.getAttribute("data-metadata");

          if (word) {
            setHoveredWord({
              word,
              title: title || undefined,
              description: description || undefined,
              metadata: metadata || undefined,
              element: hoverWordElement,
            });
          }
        }, 300); // 300ms delay
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const hoverWordElement = target.closest(".hover-word");

      if (hoverWordElement) {
        clearTimeout(hoverTimeout);
        // Don't immediately close - let the card handle this
        // This allows users to move mouse to the card
        setTimeout(() => {
          setHoveredWord(null);
        }, 100);
      }
    };

    editorElement.addEventListener("mouseenter", handleMouseEnter, true);
    editorElement.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      clearTimeout(hoverTimeout);
      editorElement.removeEventListener("mouseenter", handleMouseEnter, true);
      editorElement.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, [editor]);

  if (!hoveredWord) return null;

  return (
    <HoverWordCard
      word={hoveredWord.word}
      title={hoveredWord.title}
      description={hoveredWord.description}
      metadata={hoveredWord.metadata}
      targetElement={hoveredWord.element}
      onClose={() => setHoveredWord(null)}
    />
  );
};

export default HoverWordProvider;
