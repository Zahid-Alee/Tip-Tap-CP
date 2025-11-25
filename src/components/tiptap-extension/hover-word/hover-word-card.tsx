import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

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

      if (left + cardWidth > window.innerWidth) {
        left = window.innerWidth - cardWidth - padding;
      }

      if (left < padding) {
        left = padding;
      }

      if (top + cardHeight > window.innerHeight) {
        top = rect.top - cardHeight - padding;
      }

      if (top < padding) {
        top = padding;
      }

      setPosition({ top, left });
      setIsVisible(true);
    };

    const timer = setTimeout(calculatePosition, 10);

    const handleScroll = () => calculatePosition();

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
      className={`fixed z-[9999] border-[1px] w-[320px] max-w-[320px] bg-white rounded-xl shadow-xl p-4 font-sans transition-all duration-200
      pointer-events-auto ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Info size={16} className="text-blue-500 shrink-0" />
        <h3 className="text-base font-semibold text-gray-800 m-0 leading-snug">
          {title || word}
        </h3>
      </div>

      {/* Description */}
      {description && (
        <div className="text-sm leading-relaxed text-gray-600 mb-3">
          {description}
        </div>
      )}

      {/* Metadata */}
      {metadata && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Additional Info:
          </div>
          <div className="text-[13px] leading-snug text-gray-700">
            {metadata}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(cardContent, document.body);
};

export default HoverWordCard;
