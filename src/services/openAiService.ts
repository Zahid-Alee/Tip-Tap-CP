// ---------------- Type Declarations ----------------
interface GenerationValidation {
  expectedSections: number;
  foundSections: number;
  mainSections: number;
  hasHeader: boolean | null;
  hasFooter: boolean | null;
  isComplete: boolean;
  possibleTruncation: boolean;
  averageLength: number;
  hasAllRequiredElements: boolean;
}

interface GenerationHistoryEntry {
  id: string;
  timestamp: string;
  topic: string;
  content: string;
  validation: GenerationValidation;
  sectionTitles: string[];
  metadata: Record<string, any>;
}

let generationHistory: GenerationHistoryEntry[] = [];
const API_CONFIG = {
  openai: {
    defaultModel: "gpt-4o",
    temperature: 0.7,
    headers: (key) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    }),
  },
  gemini: {
    apiKey: "AIzaSyDLo4I-1UPOpsas6UGlwhUF6N1PWXDQVcw",
    endpoint: (key) =>
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    temperature: 0.7,
    headers: () => ({ "Content-Type": "application/json" }),
  },
  deepseek: {
    // apiKey: 'sk-6b276ef8cd6d497a8e5555235da9198a',
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    defaultModel: "deepseek-chat",
    temperature: 0.7,
    headers: (key) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    }),
  },
};

// ----------------------------------
// SECTION GUIDANCE AND CONFIGURATIONS
// ----------------------------------

const LENGTH_MAP = {
  short: "2-3 focused paragraphs with clear key points",
  medium: "3-4 well-developed paragraphs with examples and explanations",
  long: "4-5 comprehensive paragraphs with detailed coverage and multiple examples",
};

// ----------------------------------
// ENHANCED SINGLE-PROCESS GENERATION
// ----------------------------------

// Extended prompt builder to instruct the model about custom TipTap nodes (card, output block, etc.)
const createComprehensiveLecturePrompt = (formData) => {
  const {
    topic,
    sectionCount,
    sectionTypes,
    targetAudience,
    language,
    tone,
    sectionLength,
    includeHeader = false,
    includeFooter = false,
    includeEmojis = false,
    additionalInstructions = "",
  } = formData;

  console.log("sectiontypes", sectionTypes);

  const lengthDescription = LENGTH_MAP[sectionLength];
  const emojiInstruction = includeEmojis
    ? "Include relevant emojis throughout to boost engagement and visual appeal."
    : "Do NOT include emojis.";

  const totalSections =
    sectionCount + (includeHeader ? 1 : 0) + (includeFooter ? 1 : 0);
  const mainSections = sectionCount;

  return `You are an expert educator crafting an interactive, easy-to-read lecture on "${topic}".

CUSTOM EDITOR COMPONENTS (VERY IMPORTANT):
You must leverage the following custom blocks when it improves clarity or UX. Use them ONLY when contextually appropriate – don't spam them.

1. Card Component (callouts / summaries / key ideas)
Purpose: Highlight key concepts, summaries, tips, warnings, scenarios, definitions.
Variants: dark | gray-outline (choose one based on emphasis; dark = strong emphasis, gray-outline = neutral framing)
Minimal Markup (DO NOT wrap in extra containers):
<div data-type="card" data-variant="dark" class="tiptap-card tiptap-card--dark">
    <div class="tiptap-card-content">
        <h3>[Short Card Title]</h3>
        <p>[One or two concise supporting sentences.]</p>
        <ul>
            <li>[Optional bullet]</li>
        </ul>
    </div>
</div>
Rules:
- Always include exactly one .tiptap-card-content child wrapper.
- Inside the content wrapper you may use headings, paragraphs, lists, inline formatting.
- Keep cards compact (max ~80 words unless it's a summary card at end of a section).
- Do NOT nest sections inside a card.
- For multiple related tips use a SINGLE card with a list.

Optional Styling Attributes (only include if needed):
- Inline style attributes: background-color, border-color, color, border-radius, width (percent e.g. 50%), height (px). Example: style="background-color:#111;border-color:#333;border-radius:12px;width:70%".

2. Output Block (terminal / program output / captured result – NOT source code)
Purpose: Show the RESULT of executing code, CLI session excerpts, logs, JSON responses, evaluation outputs.
Markup:
<pre data-type="output-block" data-language="text" class="output-block"><code>[Exact output text with preserved line breaks]</code></pre>
Rules:
- Use data-language="text" unless clearly a specific format (json, bash, log).
- NO leading or trailing blank lines inside <code>.
- NEVER wrap with backticks or add prompts like ">" unless they are part of authentic output.
- Keep under ~15 lines; if longer, summarize then optionally add a card with key takeaways.

When to choose <pre><code class="language-*"></code></pre> vs Output Block:
- Use standard code fence HTML (<pre><code class="language-js">...</code></pre>) for SOURCE CODE the learner should type.
- Use output block for what the program/command produces.

3. Image Upload Placeholder (rare – only if explicitly instructed):
If instructions require an image upload placeholder, output:
<div data-type="image-upload"></div>
Otherwise DO NOT generate this element.

GENERAL HTML OUTPUT RULES (CRITICAL):
    - NO surrounding markdown fences (no triple-backtick markdown fences) and avoid raw backtick characters inline; instead use <code> or <pre><code>.
    - All custom components MUST appear directly where needed inside a section (or inside header/footer if relevant).
- Do not wrap custom blocks in extra <section> unless they are part of that section's flow.
- Avoid empty paragraphs or trailing whitespace. Do not start or end the entire output with blank lines.
 

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${totalSections} complete sections${
    includeHeader ? " (including a header)" : ""
  }${includeFooter ? " (including a footer)" : ""}.
- Prioritize short paragraphs, bullet lists, numbered lists, nested lists, blockquotes, and interactive elements such as tables.
- Avoid long paragraphs; use clear headings, subheadings, and concise formatting for easy comprehension.
- Each main content section ends with <hr class="section-divider" />, except the last.
- ${emojiInstruction}
- Do not use backticks anywhere in the content, for inline code use <code> element.
- Avoid adding extra spaces or empty elements in start or end of the conent.

TARGET SPECIFICATIONS:
- Audience: ${targetAudience}
- Language: ${language}
- Tone: ${tone}
- Section Length: ${lengthDescription}

${
  additionalInstructions
    ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n\n`
    : ""
}

STRUCTURE REQUIREMENTS:

${
  includeHeader
    ? `1. HEADER SECTION:
<header>
  <h1>${includeEmojis ? "[Relevant Emoji] " : ""}${topic}</h1>
  <p>Briefly introduce the lecture in an engaging, motivational style (max 3 sentences).</p>
</header>\n\n`
    : ""
}

${sectionTypes
  .map((type, index) => {
    const sectionNumber = includeHeader ? index + 2 : index + 1;
    const isLast = index === sectionTypes.length - 1;
    return `${sectionNumber}. ${type.toUpperCase()} SECTION

Please elaborate the content relevant to the **${type.toLowerCase()}**. Use clear explanations and concise structure.

Include:
- Necessary details
- Key points
- Examples (if any)

<hr class="section-divider" />${
      isLast ? " <!-- Divider excluded after the last main section -->" : ""
    }`;
  })
  .join("\n\n")}


${
  includeFooter
    ? `\n${totalSections}. FOOTER SECTION:
<footer>
  <h2>${includeEmojis ? "[Relevant Emoji] " : ""}Summary & Next Steps</h2>
  <p>Summarize key points clearly. Provide actionable next steps for continued learning.</p>
</footer>`
    : ""
}

MANDATORY HTML STRUCTURE FOR MAIN SECTIONS (Base Skeleton – enrich with cards & output blocks when helpful):
<section>
  <h2>${includeEmojis ? "[Relevant Emoji] " : ""}[Engaging Section Title]</h2>
  <p>[Concise introduction]</p>
  <ul>
    <li>[Bullet point or numbered list item]</li>
    <li>[Further detailed explanation or nested list]</li>
  </ul>
  <blockquote>[Important tip or insight]</blockquote>
    [Optional: Card(s) for key takeaway / definition / warning]
    [Optional: Output Block showing sample result]
    [Optional: Interactive table or formatted content if relevant]
</section>

HTML FORMATTING & CUSTOM COMPONENT GUIDELINES:
- <strong> for key terms
- <em> for emphasis and definitions
- <code> for inline code snippets
- <pre><code class="language-[lang]">code</code></pre> for full code examples
- <mark> to highlight critical points
- Semantic HTML for clear structure
- Cards: place AFTER the concept introduction paragraph OR near section end for summaries
- Output Blocks: immediately AFTER the code example or description whose result they demonstrate
- Never place an output block before explaining its source context

CONTENT QUALITY:
- Engaging hooks at each section's start
- Practical examples relevant to ${targetAudience}
- Gradually increase content complexity
- Maintain logical progression and clear learning outcomes

Generate the full lecture, ensuring each section is complete and engaging.`;
};

const MODEL_CONFIGS = {
  openai: {
    maxTokens: 7000,
    optimalPromptLength: 1500,
    safetyBuffer: 1000,
    maxSafeTokens: 6100,
  },
  gemini: {
    maxTokens: 8192,
    optimalPromptLength: 2000,
    safetyBuffer: 1000,
    maxSafeTokens: 7000,
  },
  deepseek: {
    maxTokens: 8192, // More conservative
    optimalPromptLength: 2000,
    safetyBuffer: 1000,
    maxSafeTokens: 7000,
  },
};

// UPDATED: Smart token calculation with section length consideration
const calculateOptimalTokens = (
  model,
  sectionCount,
  includeHeader = false,
  includeFooter = false,
  sectionLength = "medium"
) => {
  const config = MODEL_CONFIGS[model] || MODEL_CONFIGS.openai;
  const totalSections =
    sectionCount + (includeHeader ? 1 : 0) + (includeFooter ? 1 : 0);

  // Adjust base tokens per section based on length setting
  const lengthMultiplier = {
    short: 0.7,
    medium: 1.0,
    long: 1.3,
  };

  const multiplier = lengthMultiplier[sectionLength] || 1.0;

  // Calculate available tokens for content
  const availableTokens = config.maxSafeTokens - config.optimalPromptLength;

  // Base tokens per section (conservative)
  let baseTokensPerSection = Math.floor(availableTokens / totalSections);

  // Apply length multiplier
  baseTokensPerSection = Math.floor(baseTokensPerSection * multiplier);

  // Set reasonable bounds
  const minTokensPerSection = 200;
  const maxTokensPerSection = model === "openai" ? 400 : 600; // OpenAI gets stricter limits

  const tokensPerSection = Math.max(
    minTokensPerSection,
    Math.min(maxTokensPerSection, baseTokensPerSection)
  );

  // Calculate total with overhead
  const totalTokens = Math.min(
    config.maxSafeTokens,
    config.optimalPromptLength + tokensPerSection * totalSections
  );

  // console.log(`Token calculation for ${model}:`, {
  //     sectionCount,
  //     totalSections,
  //     sectionLength,
  //     multiplier,
  //     tokensPerSection,
  //     totalTokens,
  //     maxSafe: config.maxSafeTokens
  // });

  return {
    totalTokens,
    tokensPerSection,
  };
};

// UPDATED: Enhanced system prompt with completion instructions
const createSystemPrompt = (
  sectionCount,
  model,
  includeHeader = false,
  includeFooter = false,
  includeEmojis = false
) => {
  const totalSections =
    sectionCount + (includeHeader ? 1 : 0) + (includeFooter ? 1 : 0);
  const { tokensPerSection } = calculateOptimalTokens(
    model,
    sectionCount,
    includeHeader,
    includeFooter
  );

  return `You are an expert educational content creator with 15+ years of experience creating professional courses.

CORE EXPERTISE:
- Pedagogical best practices and adult learning principles
- Engaging educational content that maintains learner attention
- Professional course structure and presentation
- Clear, accessible explanations of complex topics

CRITICAL SUCCESS FACTORS:
- Generate COMPLETE content for all ${totalSections} sections total${
    includeHeader ? " (including header)" : ""
  }${includeFooter ? " (including footer)" : ""}
- Each section should be approximately ${tokensPerSection} tokens
- ABSOLUTELY NO truncation or incomplete sections allowed
- Maintain consistent quality across all sections
- Use active voice and professional educational tone
- ALWAYS end with a proper closing tag for the last section
${
  includeEmojis
    ? "- Include engaging and relevant emojis throughout the content"
    : "- Do NOT include any emojis in the content"
}

COMPLETION GUARANTEE:
- If you approach token limits, prioritize completing all sections over length
- Better to have ${totalSections} complete shorter sections than incomplete long ones
- Always close all HTML tags properly
- End with "LECTURE COMPLETE" to confirm full generation

CONTENT STANDARDS:
- Create content that feels professionally authored
- Include strategic repetition of key concepts for retention
- Build content progressively from simple to complex
- Use practical examples relevant to the target audience
${
  includeHeader
    ? "- Header must provide clear context and learning expectations"
    : ""
}
${
  includeFooter
    ? "- Footer must summarize key takeaways and provide next steps"
    : ""
}

FORMATTING EXCELLENCE:
- ALWAYS use <strong> tags for important concepts
- ALWAYS use <em> tags for definitions and terminology
- Apply formatting liberally for visual hierarchy
- Include engaging blockquotes with practical tips
${
  includeEmojis
    ? "- Use emojis strategically to enhance engagement and readability"
    : ""
}

Your goal is to create a complete, professional lecture that students would be excited to learn from.`;
};

// UPDATED: Enhanced request formatting with conservative token limits
const formatRequestByModel = (
  model,
  prompt,
  maxTokens,
  temperature,
  sectionCount,
  includeHeader = false,
  includeFooter = false,
  includeEmojis = false,
  sectionLength = "medium"
) => {
  const systemPrompt = createSystemPrompt(
    sectionCount,
    model,
    includeHeader,
    includeFooter,
    includeEmojis
  );
  const { totalTokens } = calculateOptimalTokens(
    model,
    sectionCount,
    includeHeader,
    includeFooter,
    sectionLength
  );

  // Use the more conservative calculated tokens instead of requested maxTokens
  const actualMaxTokens = Math.min(maxTokens, totalTokens);

  const commonParams = {
    temperature: temperature,
    max_tokens: actualMaxTokens,
    top_p: 0.9, // Slightly reduced for more focused output
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
  };

  switch (model) {
    case "openai":
      return {
        model: API_CONFIG.openai.defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        ...commonParams,
      };
    case "gemini":
      return {
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: actualMaxTokens,
          topP: 0.9,
          topK: 40,
        },
      };
    case "deepseek":
      return {
        model: API_CONFIG.deepseek.defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        ...commonParams,
      };
    default:
      throw new Error(`Unsupported model format: ${model}`);
  }
};

const extractContentByModel = (model, data) => {
  switch (model) {
    case "openai":
      return data.choices?.[0]?.message?.content || "";
    case "gemini":
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    case "deepseek":
      return data.choices?.[0]?.message?.content || "";
    default:
      throw new Error(`Unsupported model for content extraction: ${model}`);
  }
};

// ----------------------------------
// CONTENT PROCESSING UTILITIES
// ----------------------------------

const cleanHtmlContent = (raw) => {
  const stripped = raw
    .replace(/^```html\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/LECTURE COMPLETE/gi, "") // Remove completion marker
    .trim();

  const parser = new DOMParser();
  const doc = parser.parseFromString(stripped, "text/html");
  const body = doc.body;

  // Remove empty elements
  const elementsToClean = ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6"];
  elementsToClean.forEach((tag) => {
    body.querySelectorAll(tag).forEach((el) => {
      if (!el.textContent.trim() && el.children.length === 0) {
        el.remove();
      }
    });
  });

  // Remove empty lists
  body.querySelectorAll("ul, ol").forEach((list) => {
    if (list.children.length === 0) list.remove();
  });

  return body.innerHTML.trim();
};

const formatCodeBlocks = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const codeBlocks = doc.querySelectorAll("pre code");

  codeBlocks.forEach((codeBlock) => {
    let code = codeBlock.textContent;
    const langClass = Array.from(codeBlock.classList).find((c) =>
      c.startsWith("language-")
    );
    const language = langClass ? langClass.replace("language-", "") : "code";

    code = code.replace(/^\s*\n|\n\s*$/g, "");

    if (language && language !== "code") {
      code = formatCodeIndentation(code, language);
      if (!codeBlock.classList.contains(`language-${language}`)) {
        codeBlock.classList.add(`language-${language}`);
      }
    }

    codeBlock.textContent = code;
  });

  return doc.body.innerHTML;
};

const formatCodeIndentation = (code, language) => {
  const lines = code.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim());

  if (nonEmptyLines.length === 0) return code;

  const minIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );

  if (minIndent > 0) {
    return lines
      .map((line) => {
        return line.trim() ? line.substring(minIndent) : line;
      })
      .join("\n");
  }

  return code;
};

// UPDATED: Enhanced validation with truncation detection
const validateSectionCompleteness = (
  htmlContent,
  expectedSections,
  includeHeader = false,
  includeFooter = false
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const sections = doc.querySelectorAll("section");
  const header = doc.querySelector("header");
  const footer = doc.querySelector("footer");

  const totalExpected =
    expectedSections + (includeHeader ? 1 : 0) + (includeFooter ? 1 : 0);
  let totalFound = sections.length;

  if (includeHeader && header) totalFound++;
  if (includeFooter && footer) totalFound++;

  // Check for truncation indicators
  const lastElement = doc.body.lastElementChild;
  const contentStr = htmlContent.toLowerCase();
  const possibleTruncation =
    !contentStr.includes("</section>") ||
    (!contentStr.includes("</footer>") && includeFooter) ||
    contentStr.endsWith("...") ||
    (lastElement && !lastElement.outerHTML.includes("</"));

  const analysis = {
    expectedSections: totalExpected,
    foundSections: totalFound,
    mainSections: sections.length,
    hasHeader: includeHeader ? !!header : null,
    hasFooter: includeFooter ? !!footer : null,
    isComplete: totalFound === totalExpected && !possibleTruncation,
    possibleTruncation,
    averageLength: 0,
    hasAllRequiredElements: true,
  };

  if (sections.length > 0) {
    const totalLength = Array.from(sections).reduce((sum, section) => {
      return sum + section.textContent.length;
    }, 0);
    analysis.averageLength = Math.round(totalLength / sections.length);

    // Check if each section has required elements
    sections.forEach((section, index) => {
      const hasH2 = section.querySelector("h2") !== null;
      const hasContent = section.textContent.trim().length > 50; // Reduced threshold

      if (!hasH2 || !hasContent) {
        analysis.hasAllRequiredElements = false;
        console.warn(`Section ${index + 1} is incomplete or malformed`);
      }
    });
  }

  // Validate header and footer if required
  if (includeHeader && !header) {
    analysis.hasAllRequiredElements = false;
    console.warn("Required header is missing");
  }

  if (includeFooter && !footer) {
    analysis.hasAllRequiredElements = false;
    console.warn("Required footer is missing");
  }

  if (possibleTruncation) {
    console.warn("⚠️ Possible content truncation detected");
  }

  return analysis;
};

// ----------------------------------
// MAIN GENERATION FUNCTION
// ----------------------------------

export const generateAiContent = async (formData) => {
  // console.log('Enhanced single-process generation starting:', formData);

  const {
    model = "openai",
    sectionCount,
    sectionTypes,
    sectionLength = "medium", // Added default
    includeHeader = false,
    includeFooter = false,
    includeEmojis = false,
    additionalInstructions = "",
    ...contentParams
  } = formData;

  if (sectionCount > 10) {
    throw new Error("Maximum 10 sections allowed");
  }

  const modelConfig = API_CONFIG[model];
  if (!modelConfig) throw new Error(`Unsupported AI model: ${model}`);

  const endpoint =
    typeof modelConfig.endpoint === "function"
      ? modelConfig.endpoint(modelConfig.apiKey)
      : modelConfig.endpoint;

  try {
    // console.log('formData', formData);
    const lecturePrompt = createComprehensiveLecturePrompt(formData);
    const { totalTokens } = calculateOptimalTokens(
      model,
      sectionCount,
      includeHeader,
      includeFooter,
      sectionLength
    );

    // console.log(`Using ${totalTokens} tokens for ${sectionCount} sections${includeHeader ? ' + header' : ''}${includeFooter ? ' + footer' : ''} (${sectionLength} length)`);

    const request = formatRequestByModel(
      model,
      lecturePrompt,
      totalTokens,
      modelConfig.temperature,
      sectionCount,
      includeHeader,
      includeFooter,
      includeEmojis,
      sectionLength
    );

    // console.log('lecture prompt', lecturePrompt);

    let response: Response | undefined;
    let rawContent: string = "";

    if (model === "openai") {
      const systemPrompt = createSystemPrompt(
        sectionCount,
        model,
        includeHeader,
        includeFooter,
        includeEmojis
      );

      console.log("system prompt", systemPrompt);
      console.log("lecturePrompt", lecturePrompt);

      response = await fetch("/api/generate/text-lecture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: lecturePrompt,
          totalTokens,
          temperature: modelConfig?.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.statusText}. ${
            errorData.error?.message || ""
          }`
        );
      }

      const data = await response.json();
      rawContent = data.content;
    } else {
      response = await fetch(endpoint, {
        method: "POST",
        headers: modelConfig.headers(modelConfig.apiKey),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.statusText}. ${
            errorData.error?.message || ""
          }`
        );
      }

      const data = await response.json();
      rawContent = extractContentByModel(model, data);
    }

    if (!rawContent || rawContent.trim().length < 100) {
      throw new Error("Generated content is too short or empty");
    }

    // Process and validate content
    const cleanedContent = cleanHtmlContent(rawContent);
    const formattedContent = formatCodeBlocks(cleanedContent);

    // Validate completeness
    const validation = validateSectionCompleteness(
      formattedContent,
      sectionCount,
      includeHeader,
      includeFooter
    );

    if (!validation.isComplete) {
      console.warn(
        `⚠️ Generated ${validation.foundSections}/${validation.expectedSections} total sections`
      );
      if (validation.possibleTruncation) {
        console.warn(
          "⚠️ Content may have been truncated - consider reducing section count or length"
        );
      }
    }

    // Extract section titles
    const parser = new DOMParser();
    const doc = parser.parseFromString(formattedContent, "text/html");
    const sectionTitles = Array.from(doc.querySelectorAll("section h2")).map(
      (h2) =>
        h2.textContent.replace(/^Section \d+:\s*/, "").replace(/^[^\s]*\s/, "") // Remove emoji if present
    );

    const result = {
      content: formattedContent,
      validation,
      sectionTitles,
      metadata: {
        model,
        sectionCount,
        sectionTypes,
        sectionLength,
        includeHeader,
        includeFooter,
        includeEmojis,
        additionalInstructions,
        totalTokensUsed: totalTokens,
        averageSectionLength: validation.averageLength,
        generationTime: Date.now(),
      },
    };

    // console.log('🎉 Single-process generation completed:', {
    //     totalSectionsGenerated: validation.foundSections,
    //     mainSections: validation.mainSections,
    //     hasHeader: validation.hasHeader,
    //     hasFooter: validation.hasFooter,
    //     contentLength: formattedContent.length,
    //     averageLength: validation.averageLength,
    //     isComplete: validation.isComplete,
    //     possibleTruncation: validation.possibleTruncation
    // });

    // Save to history
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      topic: formData.topic,
      ...result,
    };

    generationHistory.unshift(historyEntry);
    saveToLocalStorage();

    return result;
  } catch (error) {
    console.error("🚨 Single-process generation failed:", error);
    throw new Error(`Lecture generation failed: ${error.message}`);
  }
};

// ----------------------------------
// HISTORY MANAGEMENT (unchanged)
// ----------------------------------

const loadGenerationHistory = () => {
  try {
    const saved = localStorage.getItem("lectureGenerationHistory");
    if (saved) {
      generationHistory = JSON.parse(saved);
      // console.log(`Loaded ${generationHistory.length} entries from localStorage`);
    }
  } catch (error) {
    console.error("Error loading generation history:", error);
    generationHistory = [];
  }
};

const saveToLocalStorage = () => {
  try {
    localStorage.setItem(
      "lectureGenerationHistory",
      JSON.stringify(generationHistory)
    );
    // console.log('Generation history saved to localStorage');
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getGenerationHistory = () => {
  return [...generationHistory];
};

export const clearGenerationHistory = () => {
  generationHistory = [];
  localStorage.removeItem("lectureGenerationHistory");
  // console.log('Generation history cleared');
};

export const getHistoryEntry = (id) => {
  return generationHistory.find((entry) => entry.id === id);
};

export const deleteHistoryEntry = (id) => {
  const index = generationHistory.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    generationHistory.splice(index, 1);
    saveToLocalStorage();
    return true;
  }
  return false;
};

// Initialize on load
loadGenerationHistory();
