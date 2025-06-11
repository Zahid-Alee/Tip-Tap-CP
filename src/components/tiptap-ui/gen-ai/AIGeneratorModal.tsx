import { useState } from "react";
import { X, Loader2, ChevronDown, Bot, Sparkles } from "lucide-react";

const AIGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
  const [isLoading, setIsLoading] = useState(false);
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onGenerate(formData);
      onClose();
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-800 mb-2"
            >
              Topic*
            </label>
            <textarea
              id="topic"
              className="block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              placeholder="Enter main topic"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              required
            ></textarea>
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
              type="submit"
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
        </form>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
