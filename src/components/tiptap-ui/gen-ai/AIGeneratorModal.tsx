import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, Bot, Sparkles, Clock, RotateCcw, Trash2 } from "lucide-react";

const AIGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [topicHistory, setTopicHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    sectionCount: 3,
    sectionTypes: [
      "paragraph",
      "bulletList",
      "codeBlock",
      "taskList",
      "blockquote",
      "heading",
    ],
    sectionLength: "medium",
    tone: "professional",
    includeHeader: true,
    includeFooter: false,
    includeEmojis: false,
    targetAudience: "students",
    model: "openai",
    language: "english",
    replaceExisting: false,
    additionalInstructions: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Local storage key for topic history
  const TOPIC_HISTORY_KEY = 'ai_generator_topic_history';

  // Load topic history from localStorage on component mount
  useEffect(() => {
    loadTopicHistory();
  }, []);

  // Auto-fill with last used topic when modal opens
  useEffect(() => {
    if (isOpen && topicHistory.length > 0) {
      setFormData(prev => ({
        ...prev,
        topic: topicHistory[0].topic
      }));
    }
  }, [isOpen, topicHistory]);

  // Load topic history from localStorage
  const loadTopicHistory = () => {
    try {
      const savedHistory = localStorage.getItem(TOPIC_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setTopicHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading topic history from localStorage:', error);
      setTopicHistory([]);
    }
  };

  // Save topic history to localStorage
  const saveTopicHistoryToStorage = (history) => {
    try {
      localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving topic history to localStorage:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.topic.trim()) {
      return; // Don't submit if topic is empty
    }
    
    setIsLoading(true);

    try {
      // Save current topic to history before generating
      saveTopicToHistory(formData.topic);
      
      await onGenerate(formData);
      onClose();
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTopicToHistory = (topic) => {
    if (!topic.trim()) return;
    
    const newEntry = {
      id: Date.now().toString(),
      topic: topic.trim(),
      timestamp: new Date().toISOString(),
      formData: { ...formData }
    };

    setTopicHistory(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(entry => entry.topic !== topic.trim());
      const updated = [newEntry, ...filtered];
      // Keep only last 20 entries
      const limited = updated.slice(0, 20);
      
      // Save to localStorage
      saveTopicHistoryToStorage(limited);
      
      return limited;
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTopicSelect = (historyEntry) => {
    setFormData(prev => ({
      ...prev,
      topic: historyEntry.topic,
      // Optionally restore other form settings
      ...historyEntry.formData
    }));
    setShowHistory(false);
  };

  // Clear all history
  const clearAllHistory = () => {
    setTopicHistory([]);
    try {
      localStorage.removeItem(TOPIC_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing topic history from localStorage:', error);
    }
    setShowHistory(false);
  };

  // Clear single topic from history
  const clearSingleTopic = (topicId, event) => {
    event.stopPropagation(); // Prevent triggering the topic selection
    
    setTopicHistory(prev => {
      const updated = prev.filter(entry => entry.id !== topicId);
      // Save updated history to localStorage
      saveTopicHistoryToStorage(updated);
      return updated;
    });
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const sectionTypeOptions = [
    { value: "paragraph", label: "Paragraph" },
    { value: "heading", label: "Heading" },
    { value: "bulletList", label: "Bullet List" },
    { value: "orderedList", label: "Numbered List" },
    { value: "taskList", label: "Task List" },
    { value: "codeBlock", label: "Code Block" },
    { value: "blockquote", label: "Blockquote" },
  ];

  const modelOptions = [
    { value: "openai", label: "OpenAI" },
    { value: "gemini", label: "Gemini" },
  ];

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
    { value: "arabic", label: "Arabic" },
    { value: "russian", label: "Russian" },
    { value: "hindi", label: "Hindi" },
    { value: "portuguese", label: "Portuguese" },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gray-100">
              <Bot className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Generate Lecture Content
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-800"
              >
                Topic*
              </label>
              {topicHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Clock className="h-4 w-4" />
                  History ({topicHistory.length})
                </button>
              )}
            </div>

            {/* Topic History Dropdown */}
            {showHistory && topicHistory.length > 0 && (
              <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Recent Topics ({topicHistory.length})
                  </span>
                  <button
                    type="button"
                    onClick={clearAllHistory}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {topicHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleTopicSelect(entry)}
                        className="w-full text-left p-2 pr-8 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-sm text-gray-800 truncate">
                          {entry.topic}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(entry.timestamp)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => clearSingleTopic(entry.id, e)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove this topic"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                id="topic"
                className="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                placeholder="Enter main topic (will be auto-filled from your last topic)"
                value={formData.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
                required
              />
              {formData.topic && (
                <button
                  type="button"
                  onClick={() => handleChange("topic", "")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  AI Model
                </label>
                <div className="flex gap-2">
                  {modelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`px-4 py-2 text-sm rounded-lg flex-1 transition-colors ${
                        formData.model === option.value
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => handleChange("model", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Language
                </label>
                <select
                  id="language"
                  className="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tone"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Tone
                </label>
                <select
                  id="tone"
                  className="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  value={formData.tone}
                  onChange={(e) => handleChange("tone", e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="humorous">Humorous</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label
                  htmlFor="audience"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Audience
                </label>
                <select
                  id="audience"
                  className="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    handleChange("targetAudience", e.target.value)
                  }
                >
                  <option value="students">Students</option>
                  <option value="beginners">Beginners</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professionals">Professionals</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Length
                </label>
                <div className="flex gap-3">
                  {["short", "medium", "long"].map((length) => (
                    <button
                      key={length}
                      type="button"
                      className={`px-4 py-2 text-sm rounded-lg capitalize transition-colors ${
                        formData.sectionLength === length
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => handleChange("sectionLength", length)}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Sections:{" "}
                  <span className="text-blue-600 font-semibold">
                    {formData.sectionCount}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                    value={formData.sectionCount}
                    onChange={(e) =>
                      handleChange("sectionCount", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Section Types */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Section Types
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {sectionTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        id={`section-${option.value}`}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.sectionTypes.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange("sectionTypes", [
                              ...formData.sectionTypes,
                              option.value,
                            ]);
                          } else {
                            handleChange(
                              "sectionTypes",
                              formData.sectionTypes.filter(
                                (type) => type !== option.value
                              )
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`section-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Options
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-header"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.includeHeader}
                      onChange={(e) =>
                        handleChange("includeHeader", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="include-header"
                      className="text-sm text-gray-700"
                    >
                      Header
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-footer"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.includeFooter}
                      onChange={(e) =>
                        handleChange("includeFooter", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="include-footer"
                      className="text-sm text-gray-700"
                    >
                      Footer
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-emojis"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.includeEmojis}
                      onChange={(e) =>
                        handleChange("includeEmojis", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="include-emojis"
                      className="text-sm text-gray-700"
                    >
                      Emojis
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="replace-existing"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.replaceExisting}
                      onChange={(e) =>
                        handleChange("replaceExisting", e.target.checked)
                      }
                    />
                    <label
                      htmlFor="replace-existing"
                      className="text-sm text-gray-700"
                    >
                      Replace Existing
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <ChevronDown
                className={`h-4 w-4 mr-1 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="pt-4">
              <label
                htmlFor="instructions"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Additional Instructions
              </label>
              <textarea
                id="instructions"
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                placeholder="Add any specific instructions for content generation..."
                value={formData.additionalInstructions}
                onChange={(e) =>
                  handleChange("additionalInstructions", e.target.value)
                }
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorModal;