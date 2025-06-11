import React, { useState, useRef, useEffect } from 'react';
import { Paintbrush } from 'lucide-react';
import { Button } from "@/components/tiptap-ui-primitive/button";

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  title?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorSelect, 
  title = 'Custom Color' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor || '#000000');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Update custom color when selected color changes
  useEffect(() => {
    setCustomColor(selectedColor || '#000000');
  }, [selectedColor]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };
  
  const handleCustomColorApply = () => {
    onColorSelect(customColor);
    setIsOpen(false);
  };
  
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        type="button"
        role="menuitem"
        data-style="ghost"
        aria-label={title}
        title={title}
        onClick={toggleDropdown}
      >
        <Paintbrush 
          className="tiptap-button-icon" 
          style={{ color: selectedColor !== 'none' ? selectedColor : undefined }}
        />
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 right-0 bottom-10 p-3 bg-white rounded-md shadow-lg border border-gray-200 w-64">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
          
          <div className="mt-2 flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 border border-gray-300 rounded p-1 text-sm"
                maxLength={7}
              />
              <button
                type="button"
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                onClick={handleCustomColorApply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;