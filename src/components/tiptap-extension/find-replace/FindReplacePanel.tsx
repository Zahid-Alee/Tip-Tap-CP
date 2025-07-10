import React, { useState, useRef, useEffect } from "react";
import { Search, Replace, X, ChevronUp, ChevronDown } from "lucide-react";

interface FindReplacePanelProps {
  editor: any;
  isOpen: boolean;
  onClose: () => void;
  initialShowReplace?: boolean;
}

export const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  editor,
  isOpen,
  onClose,
  initialShowReplace = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [showReplace, setShowReplace] = useState(initialShowReplace);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Add this useEffect to better sync with editor storage
  useEffect(() => {
    if (editor && isOpen) {
      const checkStorage = () => {
        const storage = editor.storage.findReplace;
        if (storage) {
          setResults(storage.results || []);
          setCurrentIndex(storage.currentIndex ?? -1);
        }
      };

      // Check immediately and set up interval for updates
      checkStorage();
      const interval = setInterval(checkStorage, 100);

      return () => clearInterval(interval);
    }
  }, [editor, isOpen]);
  // Update search when options change
  useEffect(() => {
    if (editor && searchTerm) {
      editor.commands.setSearchTerm(searchTerm);
      editor.commands.setCaseSensitive(caseSensitive);
      editor.commands.setWholeWord(wholeWord);
    }
  }, [editor, searchTerm, caseSensitive, wholeWord]);

  // Update results from editor storage
  useEffect(() => {
    if (editor) {
      const storage = editor.storage.findReplace;
      setResults(storage.results || []);
      setCurrentIndex(storage.currentIndex || -1);
    }
  }, [
    editor?.storage?.findReplace?.results,
    editor?.storage?.findReplace?.currentIndex,
  ]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (editor) {
      editor.commands.setSearchTerm(value);
      // Force update after a small delay to ensure DOM is updated
      setTimeout(() => {
        editor.commands.updateFindResults();
      }, 10);
    }
  };

  const handleReplaceChange = (value: string) => {
    setReplaceTerm(value);
    if (editor) {
      editor.commands.setReplaceTerm(value);
    }
  };

  const handleFindNext = () => {
    if (editor) {
      editor.commands.findNext();
    }
  };

  const handleFindPrevious = () => {
    if (editor) {
      editor.commands.findPrevious();
    }
  };

  const handleReplaceCurrent = () => {
    if (editor) {
      editor.commands.replaceCurrent();
    }
  };

  const handleReplaceAll = () => {
    if (editor) {
      editor.commands.replaceAll();
    }
  };

  const handleClose = () => {
    if (editor) {
      editor.commands.clearSearch();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindNext();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-[115px] left-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-96">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">
          {showReplace ? "Find & Replace" : "Find"}
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button
              onClick={handleFindPrevious}
              disabled={results.length === 0}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={handleFindNext}
              disabled={results.length === 0}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {results.length > 0
            ? `${currentIndex + 1} of ${results.length}`
            : "No matches"}
        </div>
      </div>

      {/* Replace Input */}
      {showReplace && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => handleReplaceChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Options */}
      <div className="mb-3 flex gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded"
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
            className="rounded"
          />
          Whole word
        </label>
      </div>

      {/* Action Buttons */}
      {showReplace && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleReplaceCurrent}
            disabled={results.length === 0}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={results.length === 0}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Toggle Replace */}
      <div className="pt-3 border-t">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showReplace ? "Hide Replace" : "Show Replace"}
        </button>
      </div>
    </div>
  );
};

// Hook for keyboard shortcuts
export const useFindReplaceShortcuts = (
  onFind: () => void,
  onReplace: () => void,
  isOpen: boolean,
  onClose: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        onFind();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        onReplace();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFind, onReplace, isOpen, onClose]);
};
