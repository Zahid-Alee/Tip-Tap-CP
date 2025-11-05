/**
 * Markdown Scanner Utility
 *
 * Detects markdown syntax in plain text and converts it to HTML
 * using patterns compatible with custom TipTap extensions.
 */

// ===== TYPES =====
export interface MarkdownPattern {
  name: string;
  regex: RegExp;
  priority: number;
  type: "inline" | "block";
  converter: (match: string, ...groups: string[]) => string;
}

export interface ScanResult {
  hasMarkdown: boolean;
  patternsFound: {
    name: string;
    count: number;
  }[];
  totalPatterns: number;
}

export interface ConversionResult {
  convertedHtml: string;
  conversions: {
    pattern: string;
    count: number;
  }[];
  success: boolean;
  error?: string;
}

// ===== PATTERN DEFINITIONS =====

/**
 * Inline Markdown Patterns
 * Priority: Higher number = processed first (to avoid conflicts)
 */
export const INLINE_PATTERNS: MarkdownPattern[] = [
  // Bold with ** (higher priority than single *)
  // Uses custom textStyle mark with fontWeight for compatibility with Bold extension
  {
    name: "bold-asterisk",
    regex: /\*\*([^\*\n]+?)\*\*/g,
    priority: 100,
    type: "inline",
    converter: (match, content) =>
      `<span style="font-weight: 700">${content}</span>`,
  },

  // Bold with __
  // Uses custom textStyle mark with fontWeight for compatibility with Bold extension
  {
    name: "bold-underscore",
    regex: /(?<!\w)__([^_\n]+?)__(?!\w)/g,
    priority: 99,
    type: "inline",
    converter: (match, content) =>
      `<span style="font-weight: 700">${content}</span>`,
  },

  // Highlight with ==
  {
    name: "highlight",
    regex: /==([^=\n]+?)==/g,
    priority: 95,
    type: "inline",
    converter: (match, content) => `<mark>${content}</mark>`,
  },

  // Strike with ~~
  {
    name: "strikethrough",
    regex: /~~([^~\n]+?)~~/g,
    priority: 90,
    type: "inline",
    converter: (match, content) => `<s>${content}</s>`,
  },

  // Underline with __ (when not bold)
  {
    name: "underline",
    regex: /_([^_\n]+?)_/g,
    priority: 85,
    type: "inline",
    converter: (match, content) => `<u>${content}</u>`,
  },

  // Italic with * (lower priority than **)
  {
    name: "italic-asterisk",
    regex: /(?<!\*)\*([^\*\n]+?)\*(?!\*)/g,
    priority: 80,
    type: "inline",
    converter: (match, content) => `<em>${content}</em>`,
  },

  // Italic with _
  {
    name: "italic-underscore",
    regex: /(?<!\w)_([^_\n]+?)_(?!\w)/g,
    priority: 75,
    type: "inline",
    converter: (match, content) => `<em>${content}</em>`,
  },

  // Inline code with `
  {
    name: "inline-code",
    regex: /`([^`\n]+?)`/g,
    priority: 110, // Highest priority - don't convert markdown inside code
    type: "inline",
    converter: (match, content) => `<code>${content}</code>`,
  },

  // Links with [text](url)
  {
    name: "link",
    regex: /\[([^\]]+)\]\(([^)]+)\)/g,
    priority: 105, // High priority, but after inline code
    type: "inline",
    converter: (match, text, url) => `<a href="${url}">${text}</a>`,
  },
];

/**
 * Block Markdown Patterns
 * These operate on lines/blocks of text
 */
export const BLOCK_PATTERNS: MarkdownPattern[] = [
  // Code blocks with ``` (highest priority for blocks)
  {
    name: "code-block",
    regex: /```(\w+)?\n([\s\S]*?)```/g,
    priority: 210, // Highest block priority - process before everything else
    type: "block",
    converter: (match, language, content) => {
      const lang = language || "plaintext";
      return `<pre><code class="language-${lang}">${content.trim()}</code></pre>`;
    },
  },

  // Headings (# through ######)
  {
    name: "heading",
    regex: /^(#{1,6})\s+(.+)$/gm,
    priority: 200,
    type: "block",
    converter: (match, hashes, content) => {
      const level = hashes.length;
      const fontFamily =
        "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const lineHeight = "1.15";
      const letterSpacing = "-0.022em";

      const fontSizes: Record<number, string> = {
        1: "4.479rem",
        2: "2.074rem",
        3: "2.074rem",
        4: "1.728rem",
        5: "1.44rem",
        6: "1.2rem",
      };

      const fontWeights: Record<number, string> = {
        1: "700",
        2: "400",
        3: "500",
        4: "500",
        5: "500",
        6: "500",
      };

      const margins: Record<number, string> = {
        1: "0 0 5rem 0",
        2: "3rem 0 2rem 0",
        3: "2.5rem 0 1.5rem 0",
        4: "2rem 0 1.25rem 0",
        5: "1.75rem 0 1rem 0",
        6: "1.5rem 0 0.75rem 0",
      };

      const style = [
        `font-family: ${fontFamily}`,
        `font-size: ${fontSizes[level]}`,
        `font-weight: ${fontWeights[level]}`,
        `line-height: ${lineHeight}`,
        `letter-spacing: ${letterSpacing}`,
        `margin: ${margins[level]}`,
      ].join("; ");

      return `<h${level} style="${style}">${content}</h${level}>`;
    },
  },

  // Blockquote
  {
    name: "blockquote",
    regex: /^>\s+(.+)$/gm,
    priority: 190,
    type: "block",
    converter: (match, content) => {
      return `<blockquote style="border-left: 0.25em solid #787c7b;">${content}</blockquote>`;
    },
  },

  // Unordered list (-, *, +)
  {
    name: "unordered-list",
    regex: /^[-*+]\s+(.+)$/gm,
    priority: 180,
    type: "block",
    converter: (match, content) => {
      return `<ul><li>${content}</li></ul>`;
    },
  },

  // Ordered list (1., 2., etc)
  {
    name: "ordered-list",
    regex: /^\d+\.\s+(.+)$/gm,
    priority: 175,
    type: "block",
    converter: (match, content) => {
      return `<ol><li>${content}</li></ol>`;
    },
  },

  // Task list unchecked
  {
    name: "task-list-unchecked",
    regex: /^[-*]\s+\[\s*\]\s+(.+)$/gm,
    priority: 185,
    type: "block",
    converter: (match, content) => {
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>${content}</div></li></ul>`;
    },
  },

  // Task list checked
  {
    name: "task-list-checked",
    regex: /^[-*]\s+\[x\]\s+(.+)$/gim,
    priority: 186,
    type: "block",
    converter: (match, content) => {
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div>${content}</div></li></ul>`;
    },
  },
];

// ===== HELPER FUNCTIONS =====

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Checks if text is already inside an HTML tag
 */
function isInsideHtmlTag(text: string, position: number): boolean {
  let insideTag = false;
  for (let i = 0; i < position; i++) {
    if (text[i] === "<") insideTag = true;
    if (text[i] === ">") insideTag = false;
  }
  return insideTag;
}

/**
 * Checks if text is inside a code block
 */
function isInsideCodeBlock(text: string, position: number): boolean {
  const beforeText = text.substring(0, position);
  const codeBlockStarts = (beforeText.match(/```/g) || []).length;
  return codeBlockStarts % 2 !== 0;
}

/**
 * Merges consecutive list items into single list
 */
function mergeLists(html: string): string {
  // Merge consecutive <ul> tags
  html = html.replace(/<\/ul>\s*<ul>/g, "");
  html = html.replace(/<\/ul>\s*<ul data-type="taskList">/g, "");

  // Merge consecutive <ol> tags
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  return html;
}

/**
 * Cleans up nested inline formatting
 */
function cleanupNested(html: string): string {
  // Remove duplicate nested tags
  html = html.replace(
    /<strong><strong>([^<]+)<\/strong><\/strong>/g,
    "<strong>$1</strong>"
  );
  html = html.replace(/<em><em>([^<]+)<\/em><\/em>/g, "<em>$1</em>");
  html = html.replace(
    /<mark><mark>([^<]+)<\/mark><\/mark>/g,
    "<mark>$1</mark>"
  );

  return html;
}

// ===== MAIN SCANNING FUNCTIONS =====

/**
 * Scans text for markdown patterns without converting
 * Returns statistics about what was found
 */
export function scanForMarkdown(text: string): ScanResult {
  const patternsFound: Map<string, number> = new Map();
  let totalPatterns = 0;

  // Combine all patterns
  const allPatterns = [...INLINE_PATTERNS, ...BLOCK_PATTERNS];

  for (const pattern of allPatterns) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      patternsFound.set(pattern.name, matches.length);
      totalPatterns += matches.length;
    }
  }

  return {
    hasMarkdown: totalPatterns > 0,
    patternsFound: Array.from(patternsFound.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    totalPatterns,
  };
}

/**
 * Converts markdown text to HTML using custom TipTap extensions
 * Processes patterns by priority to avoid conflicts
 */
export function convertMarkdownToHtml(text: string): ConversionResult {
  try {
    let html = text;
    const conversions: Map<string, number> = new Map();

    // Sort all patterns by priority (highest first)
    const allPatterns = [...INLINE_PATTERNS, ...BLOCK_PATTERNS].sort(
      (a, b) => b.priority - a.priority
    );

    // Process block patterns first (on line boundaries)
    const blockPatterns = allPatterns.filter((p) => p.type === "block");
    for (const pattern of blockPatterns) {
      let count = 0;
      html = html.replace(pattern.regex, (...args) => {
        const match = args[0];
        const groups = args.slice(1, -2); // Exclude offset and full string
        count++;
        return pattern.converter(match, ...groups);
      });

      if (count > 0) {
        conversions.set(pattern.name, count);
      }
    }

    // Merge consecutive lists
    html = mergeLists(html);

    // Process inline patterns
    const inlinePatterns = allPatterns.filter((p) => p.type === "inline");
    for (const pattern of inlinePatterns) {
      let count = 0;
      html = html.replace(pattern.regex, (...args) => {
        const match = args[0];
        const groups = args.slice(1, -2);
        count++;
        return pattern.converter(match, ...groups);
      });

      if (count > 0) {
        conversions.set(pattern.name, count);
      }
    }

    // Cleanup nested formatting
    html = cleanupNested(html);

    return {
      convertedHtml: html,
      conversions: Array.from(conversions.entries()).map(
        ([pattern, count]) => ({
          pattern,
          count,
        })
      ),
      success: true,
    };
  } catch (error) {
    return {
      convertedHtml: text,
      conversions: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Converts markdown in a specific text selection
 */
export function convertMarkdownInSelection(
  fullText: string,
  selectionStart: number,
  selectionEnd: number
): ConversionResult {
  try {
    const before = fullText.substring(0, selectionStart);
    const selection = fullText.substring(selectionStart, selectionEnd);
    const after = fullText.substring(selectionEnd);

    const result = convertMarkdownToHtml(selection);

    if (result.success) {
      return {
        ...result,
        convertedHtml: before + result.convertedHtml + after,
      };
    }

    return result;
  } catch (error) {
    return {
      convertedHtml: fullText,
      conversions: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets a human-readable summary of conversions
 */
export function getConversionSummary(result: ConversionResult): string {
  if (!result.success) {
    return `Conversion failed: ${result.error}`;
  }

  if (result.conversions.length === 0) {
    return "No markdown patterns found to convert.";
  }

  const totalConversions = result.conversions.reduce(
    (sum, c) => sum + c.count,
    0
  );
  const patternNames = result.conversions
    .map((c) => `${c.count} ${c.pattern}`)
    .join(", ");

  return `✓ Converted ${totalConversions} pattern${
    totalConversions !== 1 ? "s" : ""
  }: ${patternNames}`;
}

// ===== EXPORT =====
export default {
  scanForMarkdown,
  convertMarkdownToHtml,
  convertMarkdownInSelection,
  getConversionSummary,
  INLINE_PATTERNS,
  BLOCK_PATTERNS,
};
