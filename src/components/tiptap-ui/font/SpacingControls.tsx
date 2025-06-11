import { useState, useRef, useEffect } from 'react';
import { AlignJustify, ArrowRightLeft, MoveHorizontal, ChevronDown } from 'lucide-react';

const SpacingOption = ({ icon: Icon, label, value, onChange, min, max, step }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleChange = (e) => {
    onChange(parseFloat(e.target.value));
  };
  
  // Format display value
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
        onClick={toggleDropdown}
        title={label}
      >
        <Icon className="w-4 h-4 mr-1" />
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute z-30 mt-1 p-3 bg-white rounded-md shadow-lg w-60 border border-gray-200">
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm text-gray-500">{displayValue}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[min, (max - min) / 2 + min, max].map((preset, i) => (
              <button
                key={i}
                type="button"
                className={`py-1 px-2 text-xs rounded ${
                  Math.abs(Number(value) - preset) < 0.001
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => onChange(preset)}
              >
                {preset.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SpacingDropdown = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
        title="Spacing Controls"
      >
        <AlignJustify className="w-4 h-4 mr-1" />
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute z-30 mt-1 p-3 bg-white rounded-md shadow-lg border border-gray-200 min-w-[280px]">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Spacing Controls</h3>
          {children}
        </div>
      )}
    </div>
  );
};

const SpacingSlider = ({ label, value, onChange, min, max, step, icon: Icon }) => {
  const handleChange = (e) => {
    onChange(parseFloat(e.target.value));
  };
  
  // Format display value
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 items-center">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-1.5" />}
          {label}
        </label>
        <span className="text-sm text-gray-500">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{min}</span>
        <span className="text-xs text-gray-500">{max}</span>
      </div>
    </div>
  );
};

const SpacingControls = ({ 
  onLineHeightChange, 
  onLetterSpacingChange, 
  onWordSpacingChange,
  lineHeight = 1.5,
  letterSpacing = 0,
  wordSpacing = 0
}) => {
  return (
    <SpacingDropdown>
      <SpacingSlider
        icon={AlignJustify}
        label="Line Height"
        value={lineHeight}
        onChange={onLineHeightChange}
        min={1}
        max={3}
        step={0.1}
      />
      
      <SpacingSlider
        icon={MoveHorizontal}
        label="Letter Spacing"
        value={letterSpacing}
        onChange={onLetterSpacingChange}
        min={-0.1}
        max={0.5}
        step={0.01}
      />
      
      <SpacingSlider
        icon={ArrowRightLeft}
        label="Word Spacing"
        value={wordSpacing}
        onChange={onWordSpacingChange}
        min={0}
        max={3}
        step={0.1}
      />
    </SpacingDropdown>
  );
};

export default SpacingControls;