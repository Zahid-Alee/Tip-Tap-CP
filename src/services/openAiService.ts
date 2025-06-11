// openAiService.ts
// This module provides functions to interact with various AI models (OpenAI, Gemini, DeepSeek) for generating and processing educational content.
const API_CONFIG = {
    openai: {
        apiKey: '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',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    },
    gemini: {
        apiKey: 'AIzaSyDLo4I-1UPOpsas6UGlwhUF6N1PWXDQVcw',
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        headers: () => ({ 'Content-Type': 'application/json' })
    },
    deepseek: {
        apiKey: 'sk-6b276ef8cd6d497a8e5555235da9198a',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        defaultModel: 'deepseek-chat',
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    }
};

export const generateAiContent = async (formData) => {
    const { model = 'openai', language = 'english', replaceExisting = false, ...contentParams } = formData;
    console.log(`Generating content using ${model} model in ${language}`, contentParams);

    try {
        const prompt = createPrompt(contentParams, language);
        const modelConfig = API_CONFIG[model];

        if (!modelConfig) {
            throw new Error(`Unsupported AI model: ${model}`);
        }

        const requestData = formatRequestByModel(model, prompt);

        const endpoint = typeof modelConfig.endpoint === 'function'
            ? modelConfig.endpoint(modelConfig.apiKey)
            : modelConfig.endpoint;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: modelConfig.headers(modelConfig.apiKey),
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        const content = extractContentByModel(model, data);

        const formattedContent = formatCodeBlocks(cleanHtmlContent(content));

        return {
            content: formattedContent,
            replaceExisting
        };
    } catch (error) {
        console.error(`Error generating content with ${model}:`, error);
        throw error;
    }
};

const createPrompt = (formData, language = 'english') => {
    const {
        topic,
        sectionCount,
        sectionTypes,
        sectionLength,
        tone,
        includeHeader,
        includeFooter,
        includeEmojis,
        targetAudience,
        additionalInstructions,
    } = formData;

    const lengthGuidance = {
        short: 'Each section should be concise (1-2 paragraphs or 3-5 bullet points).',
        medium: 'Each section should contain 2-3 paragraphs or 5-8 bullet points.',
        long: 'Each section should be detailed (4+ paragraphs or 8+ bullet points).',
    }[sectionLength];

    const toneGuidance = {
        professional: 'Use formal and academic tone appropriate for scholarly contexts.',
        casual: 'Use a conversational, relaxed tone that maintains educational value while being approachable.',
        friendly: 'Use warm, approachable, and supportive language that builds rapport with learners.',
        enthusiastic: 'Use engaging and dynamic language that conveys passion for the subject matter.',
        humorous: 'Include appropriate light humor without compromising educational focus or clarity.',
        technical: 'Use precise technical terminology with clear explanations that balance expertise with accessibility.',
    }[tone];

    // Define default section types if not provided
    const sectionTypesArray = sectionTypes || ['explanation', 'examples', 'discussion'];

    // Specific guidance for different section types
    const sectionTypeGuidance = {
        explanation: 'Present core concepts clearly with definitions and context.',
        examples: 'Provide concrete, realistic examples that illustrate key concepts.',
        discussion: 'Explore implications, applications, or debates related to the topic.',
        history: 'Detail relevant historical context or development of concepts.',
        casestudy: 'Analyze real-world applications or scenarios in depth.',
        comparison: 'Contrast different approaches, theories, or perspectives.',
        exercise: 'Develop practical activities or problems for learners to solve.',
        demonstration: 'Walk through processes or techniques step by step.',
        application: 'Explain how concepts are applied in practical contexts.',
        analysis: 'Break down complex ideas into component parts with critical examination.',
        conclusion: 'Synthesize key takeaways and their broader significance.',
    };

    // Audience-specific guidance
    const audienceGuidance = {
        'beginners': 'Use simple explanations with minimal jargon. Define all technical terms. Focus on building foundational understanding.',
        'intermediate': 'Balance depth with accessibility. Assume basic knowledge while expanding into more complex aspects.',
        'advanced': 'Engage with nuanced concepts and explore complexities in depth. Analyze edge cases and limitations.',
        'professionals': 'Focus on practical applications and industry relevance. Include current best practices and standards.',
        'students': 'Structure content appropriate for academic learning with clear learning objectives and scholarly context.',
    }[targetAudience] || 'Adapt content to be appropriate and engaging for the specified audience.';

    const codeBlockGuidance = `
For any code examples:
- Always use <pre><code class="language-{languageName}"> format for all code blocks
- Ensure proper indentation with consistent spacing (preferably 2 or 4 spaces)
- Include meaningful comments to explain complex logic
- Use semantic variable and function names
- Separate logical sections with blank lines
- For HTML examples, use proper nesting and document structure
- For mathematical formulas, use appropriate notation and explain symbols
`;

    const languageInstruction = language !== 'english' 
        ? `Generate all content in ${language}. Ensure proper grammar, vocabulary, and cultural appropriateness for speakers of ${language}.`
        : '';

    return `
Generate an educational lecture on the topic: "${topic}", intended for ${targetAudience}.

${languageInstruction}

AUDIENCE GUIDANCE:
${audienceGuidance}

CONTENT STRUCTURE:
- Create exactly ${sectionCount} sections using these types: ${sectionTypesArray.join(', ')}.
- Each section should follow this pattern for its respective type:
${sectionTypesArray.map(type => `  * ${type}: ${sectionTypeGuidance[type] || 'Provide relevant content for this section type.'}`).join('\n')}
- ${includeHeader ? 'Begin with a compelling introduction that establishes context, relevance, and learning objectives.' : 'Do not include an introduction section.'}
- ${includeFooter ? 'Conclude with a comprehensive summary that reinforces key concepts and provides closure.' : 'Do not include a summary section.'}

CONTENT DEPTH AND STYLE:
- ${lengthGuidance}
- ${toneGuidance}
- Use clear topic sentences and supportive details in each paragraph.
- Incorporate varied sentence structures for engagement.
- Create natural transitions between sections and ideas.
- ${includeEmojis ? 'Include relevant emojis strategically to highlight key points and improve engagement.' : 'Do not include emojis.'}

${codeBlockGuidance}

HTML FORMATTING REQUIREMENTS:
- Format output inside one \`\`\`html code block with no explanations before or after.
- Each section must be wrapped in a <section> tag with a descriptive class name (e.g., <section class="explanation">).
- Begin each section with meaningful <h2> or <h3> headings that clearly indicate the section's purpose.
- Use semantic HTML elements appropriately:
  * <p> for paragraphs
  * <ul>/<ol> with <li> for bullet or ordered lists
  * <blockquote> for quotations or highlighted content
  * <strong> for emphasis of important concepts
  * <em> for terminology or specialized vocabulary
  * <code> for inline code references
  * <pre><code> for code blocks with proper indentation
  * <table>, <th>, <tr>, <td> for tabular data when appropriate
- Add appropriate CSS classes to elements for semantic meaning (e.g., <p class="key-concept">)
- Never include empty bullet lists or meaningless placeholder content.
- End each section with <hr /> to create clear visual separation.
- Do not use <br> tags or empty <p> elements to add spacing.
- Do not include <!DOCTYPE>, <html>, <head>, or <body> tags.
- Do not use Markdown formatting.

${additionalInstructions ? `ADDITIONAL REQUIREMENTS:\n${additionalInstructions}` : ''}

Remember that this content will be directly rendered in an educational platform, so HTML validity and semantic structure are essential for accessibility and proper display.
`.trim();
};

/**
 * Format the API request based on the selected model
 */
const formatRequestByModel = (model, prompt) => {
    const systemPrompt = 'You are an expert educational content creator specialized in creating engaging lecture content with clear structure and formatting. Your task is to generate well-structured educational material in clean HTML based on the prompt below.';

    switch (model) {
        case 'openai':
            return {
                model: API_CONFIG.openai.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            };

        case 'gemini':
            return {
                contents: [
                    {
                        parts: [
                            { text: `${systemPrompt}\n\n${prompt}` }
                        ]
                    }
                ]
            };

        case 'deepseek':
            return {
                model: API_CONFIG.deepseek.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            };

        default:
            throw new Error(`Unsupported model format: ${model}`);
    }
};

/**
 * Extract content from the API response based on the model
 */
const extractContentByModel = (model, data) => {
    switch (model) {
        case 'openai':
            return data.choices?.[0]?.message?.content || '';

        case 'gemini':
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        case 'deepseek':
            return data.choices?.[0]?.message?.content || '';

        default:
            throw new Error(`Unsupported model for content extraction: ${model}`);
    }
};
function cleanHtmlContent(raw) {
    const stripped = raw
        .replace(/^```html\s*/i, '')   
        .replace(/\s*```$/i, '');      

    const parser = new DOMParser();
    const doc = parser.parseFromString(stripped, 'text/html');
    const body = doc.body;

    body.querySelectorAll('li').forEach(li => {
        if (!li.textContent.trim()) li.remove();
    });

    body.querySelectorAll('ul, ol').forEach(list => {
        if (list.children.length === 0) list.remove();
    });

    const tagsToClean = ['p', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'div', 'span'];
    tagsToClean.forEach(tag => {
        body.querySelectorAll(tag).forEach(el => {
            if (!el.textContent.trim() && el.children.length === 0) {
                el.remove();
            }
        });
    });

    return body.innerHTML.trim();
}


function formatCodeBlocks(htmlContent) {
    // 1. Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const codeBlocks = doc.querySelectorAll('pre code');

    for (const codeBlock of codeBlocks) {
        let code = codeBlock.textContent;

        const langClass = Array.from(codeBlock.classList).find(c => c?.startsWith('language-'));
        const language = langClass ? langClass?.replace('language-', '') : '';

        if (language) {

            if (!codeBlock.classList.contains(`language-${language}`)) {
                codeBlock.classList.add(`language-${language}`);
            }

            code = formatCodeIndentation(code, language);
        } else {

            code = formatCodeIndentation(code, '');
            codeBlock.classList.add('language-code');
        }

        codeBlock.textContent = code;
    }

    return doc.body.innerHTML;
}


function formatCodeIndentation(code, language) {
    code = code.replace(/^\s*\n|\n\s*$/g, '');

    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);

    if (nonEmptyLines.length === 0) return code;

    const indentLevels = nonEmptyLines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    });

    const minIndent = Math.min(...indentLevels);

    if (minIndent > 0) {
        code = lines.map(line => {
            if (line.trim().length > 0) {
                return line.substring(minIndent);
            }
            return line;
        }).join('\n');
    }

    switch (language.toLowerCase()) {
        case 'html':
        case 'xml':
            return formatHtmlIndentation(code);

        case 'javascript':
        case 'js':
        case 'typescript':
        case 'ts':
            return formatJsIndentation(code);

        case 'css':
        case 'scss':
            return formatCssIndentation(code);

        case 'python':
            return code;

        default:
            return code;
    }
}

function formatHtmlIndentation(code) {
    let formattedCode = '';
    let indentLevel = 0;
    const indentSize = 2;
    const lines = code.split('\n');

    for (let line of lines) {
        const trimmedLine = line.trim();

        // Decrease indent for closing tags before adding the line
        if (trimmedLine.startsWith('</') && !trimmedLine.startsWith('</br>')) {
            indentLevel--;
        }

        // Special case for self-closing tags
        const isSelfClosing = trimmedLine.endsWith('/>') && !trimmedLine.startsWith('</');

        // Add the line with proper indentation
        if (trimmedLine.length > 0) {
            formattedCode += ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmedLine + '\n';
        } else {
            formattedCode += '\n'; // Preserve empty lines
        }

        // Increase indent for opening tags after adding the line
        if ((trimmedLine.startsWith('<') &&
            !trimmedLine.startsWith('</') &&
            !isSelfClosing &&
            !trimmedLine.startsWith('<br') &&
            !trimmedLine.startsWith('<img') &&
            !trimmedLine.startsWith('<input') &&
            !trimmedLine.startsWith('<hr') &&
            !trimmedLine.startsWith('<meta') &&
            !trimmedLine.startsWith('<link') &&
            !trimmedLine.includes('</')) ||
            (trimmedLine.includes('<') && trimmedLine.indexOf('<') < trimmedLine.indexOf('>') && !trimmedLine.includes('</'))) {
            indentLevel++;
        }
    }

    return formattedCode.trim();
}

function formatJsIndentation(code) {
    let formattedCode = '';
    let indentLevel = 0;
    const indentSize = 2;
    const lines = code.split('\n');

    for (let line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')') || trimmedLine.startsWith(']')) {
            indentLevel--;
        }

        if (trimmedLine.length > 0) {
            formattedCode += ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmedLine + '\n';
        } else {
            formattedCode += '\n';
        }

        const openBraces = (trimmedLine.match(/{/g) || []).length;
        const closeBraces = (trimmedLine.match(/}/g) || []).length;
        const openParens = (trimmedLine.match(/\(/g) || []).length;
        const closeParens = (trimmedLine.match(/\)/g) || []).length;
        const openBrackets = (trimmedLine.match(/\[/g) || []).length;
        const closeBrackets = (trimmedLine.match(/\]/g) || []).length;

        indentLevel += openBraces - closeBraces + openParens - closeParens + openBrackets - closeBrackets;

        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') ||
            trimmedLine.endsWith('(') || trimmedLine.endsWith('=>')) {
            indentLevel++;
        }
    }

    return formattedCode.trim();
}

function formatCssIndentation(code) {
    let formattedCode = '';
    let indentLevel = 0;
    const indentSize = 2;
    const lines = code.split('\n');

    for (let line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('}')) {
            indentLevel--;
        }

        if (trimmedLine.length > 0) {
            formattedCode += ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmedLine + '\n';
        } else {
            formattedCode += '\n';
        }

        if (trimmedLine.endsWith('{')) {
            indentLevel++;
        }
    }

    return formattedCode.trim();
}