import * as React from "react";
import { SigmaIcon } from "@/components/tiptap-icons/sigma-icon";
import Button from "@/components/tiptap-ui-primitive/button/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/tiptap-ui-primitive/dialog";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./math-formula.scss";

interface MathFormulaButtonProps {
  editor: any;
  disabled?: boolean;
}

const FORMULA_EXAMPLES = [
  {
    name: "Quadratic Formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  },
  { name: "Pythagorean", latex: "a^2 + b^2 = c^2" },
  { name: "Summation", latex: "\\sum_{i=1}^{n} i" },
  { name: "Integral", latex: "\\int_{a}^{b} f(x) dx" },
];

const COMMON_SYMBOLS = [
  { symbol: "\\alpha", display: "α", label: "alpha" },
  { symbol: "\\beta", display: "β", label: "beta" },
  { symbol: "\\gamma", display: "γ", label: "gamma" },
  { symbol: "\\pi", display: "π", label: "pi" },
  { symbol: "\\theta", display: "θ", label: "theta" },
  { symbol: "\\sum", display: "∑", label: "sum" },
  { symbol: "\\int", display: "∫", label: "integral" },
  { symbol: "\\infty", display: "∞", label: "infinity" },
  { symbol: "\\sqrt{}", display: "√", label: "sqrt" },
  { symbol: "\\frac{}{}", display: "÷", label: "fraction" },
  { symbol: "^{}", display: "xⁿ", label: "power" },
  { symbol: "_{}", display: "xₙ", label: "subscript" },
  { symbol: "\\pm", display: "±", label: "plus-minus" },
  { symbol: "\\times", display: "×", label: "times" },
  { symbol: "\\leq", display: "≤", label: "less-equal" },
  { symbol: "\\geq", display: "≥", label: "greater-equal" },
  { symbol: "\\neq", display: "≠", label: "not-equal" },
  { symbol: "\\approx", display: "≈", label: "approx" },
];

export const MathFormulaButton: React.FC<MathFormulaButtonProps> = ({
  editor,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [latex, setLatex] = React.useState("");
  const [isBlock, setIsBlock] = React.useState(false);
  const [preview, setPreview] = React.useState("");
  const [error, setError] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (latex.trim() === "") {
      setPreview("");
      setError("");
      return;
    }

    try {
      const html = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: isBlock,
      });
      setPreview(html);
      setError("");
    } catch (err: any) {
      setPreview("");
      setError(err.message || "Invalid LaTeX syntax");
    }
  }, [latex, isBlock]);

  const insertFormula = () => {
    if (!editor || latex.trim() === "" || error) return;

    try {
      // Insert the formula using our custom math node
      editor.chain().focus().insertMathFormula(latex.trim(), isBlock).run();

      // Add a space after inline formulas for better editing
      if (!isBlock) {
        editor.commands.insertContent(" ");
      }

      // Reset and close
      setLatex("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error inserting formula:", err);
      setError("Failed to insert formula");
    }
  };

  const insertExample = (exampleLatex: string) => {
    setLatex(exampleLatex);
    textareaRef.current?.focus();
  };

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = latex.substring(0, start) + symbol + latex.substring(end);

    setLatex(newText);

    // Set cursor position after the inserted symbol
    setTimeout(() => {
      const newPos = start + symbol.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertFormula();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled || !editor}
          className="tiptap-button"
          tooltip="Insert Math Formula"
        >
          <SigmaIcon className="tiptap-button-icon" />
        </Button>
      </DialogTrigger>
      <DialogContent className="math-formula-dialog max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Math Formula</DialogTitle>
        </DialogHeader>

        <div className="math-dialog-body">
          {/* Main Editor Section */}
          <div className="math-editor-section">
            <div className="math-input-wrapper">
              <label className="math-label">LaTeX Formula</label>
              <textarea
                ref={textareaRef}
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., x^2 + y^2 = r^2"
                className="math-textarea"
                rows={4}
              />
              <div className="math-hint">
                <span className="hint-text">Ctrl+Enter to insert</span>
                <label className="math-checkbox">
                  <input
                    type="checkbox"
                    checked={isBlock}
                    onChange={(e) => setIsBlock(e.target.checked)}
                  />
                  <span>Block display</span>
                </label>
              </div>
            </div>

            {/* Quick Symbols */}
            <div className="math-symbols-wrapper">
              <label className="math-label">Quick Symbols</label>
              <div className="math-symbols-grid">
                {COMMON_SYMBOLS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => insertSymbol(item.symbol)}
                    className="math-symbol-btn"
                    title={item.label}
                    type="button"
                  >
                    {item.display}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="math-error-box">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
              </div>
            )}

            {preview && !error && (
              <div className="math-preview-wrapper">
                <label className="math-label">Preview</label>
                <div
                  className={`math-preview-content ${
                    isBlock ? "block-display" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
            )}
          </div>

          {/* Examples Sidebar */}
          <div className="math-examples-sidebar">
            <label className="math-label">Examples</label>
            <div className="examples-list">
              {FORMULA_EXAMPLES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => insertExample(example.latex)}
                  className="example-item"
                  type="button"
                >
                  <div className="example-name">{example.name}</div>
                  <div
                    className="example-preview"
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(example.latex, {
                        throwOnError: false,
                        displayMode: false,
                      }),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="math-dialog-footer">
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="math-btn-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={insertFormula}
            disabled={!latex.trim() || !!error}
            className="math-btn-insert"
          >
            Insert Formula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
