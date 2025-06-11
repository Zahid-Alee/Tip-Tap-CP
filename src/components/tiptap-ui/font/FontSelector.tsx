import './font.scss';

// Font type definitions
interface Font {
  name: string;
  value: string;
}

interface FontCategory {
  name: string;
  fonts: Font[];
}

interface FontSelectorProps {
  onFontSelect: (fontValue: string) => void;
  selectedFont: string;
}

// Common fonts list
const FONTS: Font[] = [
  { name: 'Default', value: '' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Fira Code', value: '"Fira Code", monospace' }
];

// Group fonts by category
const FONT_CATEGORIES: FontCategory[] = [
  {
    name: 'Sans-serif',
    fonts: FONTS.filter(font => 
      font.value.includes('sans-serif') && 
      !font.value.includes('monospace') && 
      !font.value.includes('cursive')
    )
  },
  {
    name: 'Serif',
    fonts: FONTS.filter(font => 
      font.value.includes('serif') && 
      !font.value.includes('sans-serif')
    )
  },
  {
    name: 'Monospace',
    fonts: FONTS.filter(font => 
      font.value.includes('monospace')
    )
  },
  {
    name: 'Other',
    fonts: [
      FONTS[0], // Default
      ...FONTS.filter(font => 
        font.value.includes('cursive') ||
        (!font.value.includes('sans-serif') && 
         !font.value.includes('serif') && 
         !font.value.includes('monospace') &&
         font.value !== '') // exclude Default font
      )
    ]
  }
];

const FontSelector: React.FC<FontSelectorProps> = ({ onFontSelect, selectedFont }) => {
  // Find display name for current font
  const getFontDisplayName = (fontValue: string): string => {
    const font = FONTS.find(f => f.value === fontValue);
    return font ? font.name : 'Default';
  };
  
  const handleFontSelect = (fontValue: string) => {
    onFontSelect(fontValue);
  };
  
  return (
    <div className="w-64 bg-white max-h-80 overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
        <h3 className="text-xs font-medium text-gray-700">Font Family</h3>
      </div>
      
      <div className="py-1">
        {FONT_CATEGORIES.map((category, catIndex) => (
          <div key={catIndex} className="mb-2">
            <h4 className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
              {category.name}
            </h4>
            <ul>
              {category.fonts.map((font, fontIndex) => (
                <li key={`${catIndex}-${fontIndex}`}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      font.value === selectedFont ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                    style={{ fontFamily: font.value || 'inherit' }}
                    onClick={() => handleFontSelect(font.value)}
                  >
                    {font.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export font utilities as well to be used in other components
export { FONTS, FONT_CATEGORIES };
export default FontSelector;