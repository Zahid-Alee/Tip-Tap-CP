import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Info, ExternalLink } from "lucide-react";

interface HoverWordCardProps {
  word: string;
  title?: string;
  description?: string;
  metadata?: string;
  targetElement: HTMLElement;
  onClose?: () => void;
}

export const HoverWordCard: React.FC<HoverWordCardProps> = ({
  word,
  title,
  description,
  metadata,
  targetElement,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const cardWidth = 320;
      const cardHeight = cardRef.current?.offsetHeight || 200;
      const padding = 8;

      let top = rect.bottom + padding;
      let left = rect.left;

      // Adjust if card would go off the right edge
      if (left + cardWidth > window.innerWidth) {
        left = window.innerWidth - cardWidth - padding;
      }

      // Adjust if card would go off the left edge
      if (left < padding) {
        left = padding;
      }

      // If card would go off the bottom, show it above the element
      if (top + cardHeight > window.innerHeight) {
        top = rect.top - cardHeight - padding;
      }

      // If still off screen at top, clamp to visible area
      if (top < padding) {
        top = padding;
      }

      setPosition({ top, left });
      setIsVisible(true);
    };

    // Small delay to ensure card is rendered before calculating position
    const timer = setTimeout(calculatePosition, 10);

    const handleScroll = () => {
      calculatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [targetElement]);

  const cardContent = (
    <div
      ref={cardRef}
      className={`hover-word-card ${isVisible ? "visible" : ""}`}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      onMouseEnter={() => {
        // Keep card open when hovering over it
      }}
      onMouseLeave={onClose}
    >
      <div className="hover-word-card-header">
        <Info size={16} className="hover-word-card-icon" />
        <h3 className="hover-word-card-title">{title || word}</h3>
      </div>

      {description && (
        <div className="hover-word-card-description">{description}</div>
      )}

      {metadata && (
        <div className="hover-word-card-metadata">
          <div className="hover-word-card-metadata-label">Additional Info:</div>
          <div className="hover-word-card-metadata-content">{metadata}</div>
        </div>
      )}
    </div>
  );

  return createPortal(cardContent, document.body);
};

export default HoverWordCard;
