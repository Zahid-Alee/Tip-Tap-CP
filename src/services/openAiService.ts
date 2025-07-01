let generationHistory = [];

const API_CONFIG = {
    openai: {
        apiKey: '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',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        temperature: 0.3, // Reduced for more consistent educational content
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    },
    gemini: {
        apiKey: 'AIzaSyDLo4I-1UPOpsas6UGlwhUF6N1PWXDQVcw',
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        temperature: 0.3,
        headers: () => ({ 'Content-Type': 'application/json' })
    },
    deepseek: {
        apiKey: 'sk-6b276ef8cd6d497a8e5555235da9198a',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        defaultModel: 'deepseek-chat',
        temperature: 0.3,
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    }
};

// Token calculation based on section count and length
const calculateMaxTokens = (sectionCount, sectionLength) => {
    const baseTokens = {
        short: 300,
        medium: 500,
        long: 800
    };
    
    const tokensPerSection = baseTokens[sectionLength] || 500;
    const headerFooterTokens = 200;
    
    return Math.min((sectionCount * tokensPerSection) + headerFooterTokens, 4000);
};

/**
 * Load generation history from localStorage
 */
const loadGenerationHistory = () => {
    try {
        const saved = localStorage.getItem('lectureGenerationHistory');
        if (saved) {
            generationHistory = JSON.parse(saved);
            console.log(`Loaded ${generationHistory.length} entries from localStorage`);
        }
    } catch (error) {
        console.error('Error loading generation history:', error);
        generationHistory = [];
    }
};

/**
 * Save generation history to localStorage
 */
const saveToLocalStorage = () => {
    try {
        localStorage.setItem('lectureGenerationHistory', JSON.stringify(generationHistory));
        console.log('Generation history saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

/**
 * Save generation history entry
 */
const saveGenerationHistory = (userPrompt, aiResponse, formData) => {
    const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userPrompt: userPrompt,
    };

    generationHistory.unshift(historyEntry);
    
    if (generationHistory.length > 100) {
        generationHistory = generationHistory.slice(0, 100);
    }

    saveToLocalStorage();
    return historyEntry;
};

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
const estimateTokenCount = (text) => {
    return Math.ceil(text.length / 4);
};

/**
 * Get all generation history
 */
export const getGenerationHistory = () => {
    return [...generationHistory];
};

/**
 * Clear generation history
 */
export const clearGenerationHistory = () => {
    generationHistory = [];
    localStorage.removeItem('lectureGenerationHistory');
    console.log('Generation history cleared');
};

/**
 * Get specific history entry by ID
 */
export const getHistoryEntry = (id) => {
    return generationHistory.find(entry => entry.id === id);
};

/**
 * Delete specific history entry
 */
export const deleteHistoryEntry = (id) => {
    const index = generationHistory.findIndex(entry => entry.id === id);
    if (index !== -1) {
        generationHistory.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
};

/**
 * Create user-friendly prompt summary from form data
 */
const createUserPromptSummary = (formData) => {
    const {
        topic,
        sectionCount,
        sectionTypes,
        sectionLength,
        tone,
        targetAudience,
        language,
        additionalInstructions
    } = formData;

    let summary = `Generate educational content about "${topic}"`;
    
    if (targetAudience) {
        summary += ` for ${targetAudience}`;
    }
    
    if (sectionCount) {
        summary += ` with ${sectionCount} sections`;
    }
    
    if (sectionTypes && sectionTypes.length > 0) {
        summary += ` (${sectionTypes.join(', ')})`;
    }
    
    if (sectionLength) {
        summary += ` in ${sectionLength} format`;
    }
    
    if (tone) {
        summary += ` using ${tone} tone`;
    }
    
    if (language && language !== 'english') {
        summary += ` in ${language}`;
    }
    
    if (additionalInstructions) {
        summary += `. Additional instructions: ${additionalInstructions}`;
    }

    return summary;
};

// Initialize by loading existing history
loadGenerationHistory();

export const generateAiContent = async (formData) => {
    const { model = 'openai', language = 'english', replaceExisting = false, ...contentParams } = formData;

    try {
        const userPrompt = createUserPromptSummary(formData);
        const aiPrompt = createOptimizedPrompt(contentParams, language);
        const modelConfig = API_CONFIG[model];

        if (!modelConfig) {
            throw new Error(`Unsupported AI model: ${model}`);
        }

        const maxTokens = calculateMaxTokens(contentParams.sectionCount, contentParams.sectionLength);
        const requestData = formatRequestByModel(model, aiPrompt, maxTokens, modelConfig.temperature);

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
        const finalContent = optimizeRulerPlacement(formattedContent);

        // Save to history
        // const historyEntry = saveGenerationHistory(userPrompt, finalContent, formData);

        return {
            content: finalContent,
            replaceExisting,
            // historyId: historyEntry.id,
            // timestamp: historyEntry.timestamp,
            // tokenCount: historyEntry.tokenCount,
            maxTokens: maxTokens
        };
    } catch (error) {
        console.error(`Error generating content with ${model}:`, error);
        throw error;
    }
};

/**
 * Optimized prompt creation with better educational focus
 */
const createOptimizedPrompt = (formData, language = 'english') => {
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
        short: 'Each section should be concise and focused (1-2 paragraphs with key points clearly stated).',
        medium: 'Each section should provide moderate detail (2-3 well-developed paragraphs with examples).',
        long: 'Each section should be comprehensive and detailed (4+ paragraphs with thorough explanations and multiple examples).',
    }[sectionLength];

    const toneGuidance = {
        professional: 'Use formal, authoritative language with academic rigor while maintaining clarity.',
        casual: 'Use conversational, accessible language that maintains educational depth without being overly formal.',
        friendly: 'Use warm, encouraging language that builds confidence and maintains learner engagement.',
        enthusiastic: 'Use dynamic, passionate language that conveys excitement about the subject matter.',
        humorous: 'Include appropriate, educational humor that enhances learning without distracting from content.',
        technical: 'Use precise terminology with clear definitions, balancing technical accuracy with comprehensibility.',
    }[tone];

    const sectionTypesArray = sectionTypes || ['explanation', 'examples', 'discussion'];

    const sectionTypeGuidance = {
        explanation: 'Provide clear, systematic explanations of core concepts with proper definitions.',
        examples: 'Present concrete, relevant examples that demonstrate practical applications.',
        discussion: 'Explore different perspectives, implications, and critical analysis of the topic.',
        history: 'Detail chronological development and historical context with key milestones.',
        casestudy: 'Analyze specific real-world scenarios with detailed examination of outcomes.',
        comparison: 'Present systematic comparisons highlighting similarities, differences, and trade-offs.',
        exercise: 'Design practical learning activities with clear instructions and expected outcomes.',
        demonstration: 'Provide step-by-step procedural guidance with clear methodology.',
        application: 'Show practical implementation with real-world relevance and utility.',
        analysis: 'Break down complex concepts into components with critical examination.',
        conclusion: 'Synthesize key insights and provide actionable takeaways.',
    };

    const audienceGuidance = {
        'beginners': 'Use foundational language, define all terms, build from basic principles with scaffolded learning.',
        'intermediate': 'Assume basic knowledge, introduce complexity gradually, connect to prior learning.',
        'advanced': 'Engage with sophisticated concepts, explore nuances, address exceptions and edge cases.',
        'professionals': 'Focus on practical applications, industry standards, best practices, and actionable insights.',
        'students': 'Structure content for academic learning with clear objectives and assessment-ready material.',
    }[targetAudience] || 'Adapt content appropriately for the specified audience level.';

    const languageInstruction = language !== 'english' 
        ? `Generate ALL content in ${language}. Use proper grammar, appropriate vocabulary, and culturally relevant examples for ${language} speakers.`
        : '';

    const rulerInstruction = `
IMPORTANT RULER PLACEMENT:
- Add <hr class="section-divider" /> at the END of each section
- DO NOT add a ruler after the very last section
- This creates proper visual separation between sections
`;

    return `
You are an expert educational content creator. Generate a structured, comprehensive lecture on: "${topic}"

TARGET AUDIENCE: ${targetAudience}
${audienceGuidance}

${languageInstruction}

CONTENT STRUCTURE REQUIREMENTS:
- Create EXACTLY ${sectionCount} sections using these types: ${sectionTypesArray.join(', ')}
- Each section type should follow this guidance:
${sectionTypesArray.map(type => `  • ${type}: ${sectionTypeGuidance[type] || 'Provide relevant, high-quality content for this section type.'}`).join('\n')}

SECTION GUIDELINES:
- ${lengthGuidance}
- ${toneGuidance}
- Use clear topic sentences and logical flow
- Include relevant examples and practical applications
- Maintain academic rigor while ensuring accessibility
- ${includeEmojis ? 'Include strategic emojis to enhance engagement and highlight key concepts.' : 'Do not include emojis.'}

STRUCTURAL REQUIREMENTS:
- ${includeHeader ? 'Begin with an engaging introduction that establishes context, learning objectives, and relevance.' : 'Start directly with the main content sections.'}
- ${includeFooter ? 'End with a comprehensive summary that reinforces key concepts and provides clear takeaways.' : 'End with the final main content section.'}

${rulerInstruction}

HTML FORMATTING REQUIREMENTS:
- Output ONLY the HTML content wrapped in a single \`\`\`html code block
- Use semantic HTML structure:
  • Each section: <section class="[section-type]">
  • Section headings: <h2> or <h3> with descriptive titles
  • Paragraphs: <p> with appropriate classes for key concepts
  • Lists: <ul>/<ol> with <li> for organized information
  • Emphasis: <strong> for important terms, <em> for definitions
  • Code examples: <pre><code class="language-[lang]"> with proper indentation
  • Tables: <table> with <th>, <tr>, <td> for structured data
- Add <hr class="section-divider" /> at the end of each section EXCEPT the last one
- No empty elements, placeholder content, or unnecessary markup
- No DOCTYPE, html, head, or body tags needed

CODE BLOCK FORMATTING:
- Use <pre><code class="language-[language]"> for all code examples
- Ensure proper 2-space indentation and meaningful comments
- Include complete, functional examples where applicable

${additionalInstructions ? `ADDITIONAL REQUIREMENTS:\n${additionalInstructions}` : ''}

Focus on creating educational content that is both informative and engaging, with clear learning outcomes for the specified audience.
`.trim();
};

/**
 * Optimize ruler placement - remove ruler from last section
 */
const optimizeRulerPlacement = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const sections = doc.querySelectorAll('section');
    if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        const rulers = lastSection.querySelectorAll('hr');
        rulers.forEach(hr => hr.remove());
        
        // Also remove any trailing hr elements
        const allHrs = doc.querySelectorAll('hr');
        if (allHrs.length > 0) {
            const lastHr = allHrs[allHrs.length - 1];
            // Check if this HR is after the last section
            const lastSectionEnd = lastSection.offsetTop + lastSection.offsetHeight;
            if (lastHr.offsetTop >= lastSectionEnd) {
                lastHr.remove();
            }
        }
    }
    
    return doc.body.innerHTML;
};

/**
 * Format the API request based on the selected model with optimized parameters
 */
const formatRequestByModel = (model, prompt, maxTokens, temperature) => {
    const systemPrompt = `You are an expert educational content creator and instructional designer. Your expertise includes:
- Creating engaging, pedagogically sound educational content
- Structuring information for optimal learning outcomes  
- Adapting content for different audience levels
- Using appropriate academic tone and language
- Implementing best practices in educational design

Generate well-structured, semantically correct HTML educational content that follows modern educational standards and accessibility guidelines.`;

    const commonParams = {
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
    };

    switch (model) {
        case 'openai':
            return {
                model: API_CONFIG.openai.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                ...commonParams
            };

        case 'gemini':
            return {
                contents: [
                    {
                        parts: [
                            { text: `${systemPrompt}\n\n${prompt}` }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens,
                    topP: 0.9
                }
            };

        case 'deepseek':
            return {
                model: API_CONFIG.deepseek.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                ...commonParams
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

    // Remove empty list items
    body.querySelectorAll('li').forEach(li => {
        if (!li.textContent.trim()) li.remove();
    });

    // Remove empty lists
    body.querySelectorAll('ul, ol').forEach(list => {
        if (list.children.length === 0) list.remove();
    });

    // Clean empty elements
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

        if (trimmedLine.startsWith('</') && !trimmedLine.startsWith('</br>')) {
            indentLevel--;
        }

        const isSelfClosing = trimmedLine.endsWith('/>') && !trimmedLine.startsWith('</');

        if (trimmedLine.length > 0) {
            formattedCode += ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmedLine + '\n';
        } else {
            formattedCode += '\n';
        }

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