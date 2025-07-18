let generationHistory = [];

const API_CONFIG = {
    openai: {
        apiKey: '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',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o',
        temperature: 0.7,
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    },
    gemini: {
        apiKey: 'AIzaSyDLo4I-1UPOpsas6UGlwhUF6N1PWXDQVcw',
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        temperature: 0.7,
        headers: () => ({ 'Content-Type': 'application/json' })
    },
    deepseek: {
        apiKey: 'sk-6b276ef8cd6d497a8e5555235da9198a',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        defaultModel: 'deepseek-chat',
        temperature: 0.7,
        headers: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        })
    }
};

// ----------------------------------
// SECTION-BY-SECTION GENERATION CORE
// ----------------------------------


const createSystemPrompt = () => {
    return `You are an expert educational content creator and instructional designer with 15+ years of experience creating professional courses for platforms like Udemy, Coursera, and LinkedIn Learning.

CORE EXPERTISE:
- Pedagogical best practices and adult learning principles
- Engaging educational content that maintains learner attention
- Professional course structure and presentation
- Clear, accessible explanations of complex topics
- Strategic use of examples, analogies, and real-world applications

CONTENT STANDARDS:
- Create content that feels professionally authored, not AI-generated
- Maintain consistent educational tone throughout
- Use active voice and conversational yet professional language
- Include strategic repetition of key concepts for retention
- Build content progressively from simple to complex

FORMATTING REQUIREMENTS - CRITICAL:
- ALWAYS use <strong> tags for important concepts, key terms, and emphasis
- ALWAYS use <em> tags for definitions, first mentions of terminology, and subtle emphasis
- ALWAYS use <code> tags for inline code
- Apply formatting liberally - educational content should have visual hierarchy
- Use proper HTML semantic structure with correct nesting
- Include as many specialized blurbs as possible to keep it exciting, interactive, and highly engaging. Always format them as blockquotes

ENGAGEMENT PRINCIPLES:
- Start each section with a compelling hook or question
- Use practical examples relevant to the target audience
- Include "pro tips" and insider insights as blockquotes
- End sections with clear takeaways or action items
- Maintain enthusiasm and expertise throughout

Generate content that students would be excited to learn from and instructors would be proud to teach.`;
};

const SECTION_GUIDANCE = {
    explanation: 'Provide clear, systematic explanations with practical examples.',
    examples: 'Present real-world examples with detailed breakdowns.',
    discussion: 'Explore implications, best practices, and critical considerations.',
    history: 'Cover key milestones and evolution with contextual significance.',
    casestudy: 'Analyze real scenarios with outcomes and lessons learned.',
    comparison: 'Create clear comparisons with pros, cons, and use cases.',
    exercise: 'Design practical activities with clear objectives and outcomes.',
    demonstration: 'Provide step-by-step procedures with explanations.',
    application: 'Show real-world implementation with practical guidance.',
    analysis: 'Break down complex concepts with systematic examination.',
    conclusion: 'Synthesize key insights with actionable takeaways.'
};

const LENGTH_MAP = {
    short: '2-3 focused paragraphs with clear key points',
    medium: '4-5 well-developed paragraphs with examples and explanations',
    long: '6-8 comprehensive paragraphs with detailed coverage and multiple examples'
};

function createSectionPrompt({
    topic,
    sectionType,
    sectionNumber,
    sectionTotal,
    title,
    titlesSoFar,
    targetAudience,
    language,
    sectionLength,
    tone,
}) {
    return `
You are an expert educational content creator. Generate a SINGLE HTML <section> for a professional lecture on: "${topic}".

Section to Generate: ${sectionNumber} of ${sectionTotal}
Section Type: ${sectionType}
Section Title: ${title}
Previous Section Titles: ${titlesSoFar.length ? titlesSoFar.join(', ') : 'None'}
Target Audience: ${targetAudience}
Language: ${language}
Length: ${LENGTH_MAP[sectionLength] || LENGTH_MAP.medium}
Tone: ${tone}

Formatting & Structure Rules (MANDATORY):
- Output ONLY pure HTML, nothing else.
- Wrap the section in <section> tags, starting with an <h2> containing the section title.
- Use <blockquote> in every section for key points, pro tips, or important insights.
- Bold key terms and concepts using <strong>. Use <em> for definitions or first mentions.
- Highlight important sentences or concepts with <mark>.
- Include at least one well-formatted code block (never empty).
- Add practical examples, hooks, and clear takeaways as per type.
- NO duplicate content with previous sections. Refer to "Previous Section Titles".
- Do NOT add any header or footer text outside of section content.

${sectionNumber < sectionTotal ? 'AFTER </section> output: <hr class="section-divider" />' : ''}

Section Specific Guidance: ${SECTION_GUIDANCE[sectionType] || ''}
`.trim();
}

const formatRequestByModel = (model, prompt, maxTokens, temperature) => {
    const systemPrompt = createSystemPrompt();

    const commonParams = {
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
        frequency_penalty: 0.2,
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
                    topP: 0.95,
                    topK: 40
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

const cleanHtmlContent = (raw) => {
    const stripped = raw
        .replace(/^```html\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    const parser = new DOMParser();
    const doc = parser.parseFromString(stripped, 'text/html');
    const body = doc.body;

    const elementsToClean = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    elementsToClean.forEach(tag => {
        body.querySelectorAll(tag).forEach(el => {
            if (!el.textContent.trim() && el.children.length === 0) {
                el.remove();
            }
        });
    });

    body.querySelectorAll('ul, ol').forEach(list => {
        if (list.children.length === 0) list.remove();
    });

    body.querySelectorAll('strong, em').forEach(el => {
        const parent = el.parentElement;
        if (parent && parent.tagName === 'P') {
        } else if (parent && parent.tagName === 'BODY') {
            const p = document.createElement('p');
            parent.insertBefore(p, el);
            p.appendChild(el);
        }
    });

    return body.innerHTML.trim();
};

const formatCodeBlocks = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const codeBlocks = doc.querySelectorAll('pre code');

    codeBlocks.forEach(codeBlock => {
        let code = codeBlock.textContent;
        const langClass = Array.from(codeBlock.classList).find(c => c.startsWith('language-'));
        const language = langClass ? langClass.replace('language-', '') : 'code';

        code = code.replace(/^\s*\n|\n\s*$/g, '');

        if (language && language !== 'code') {
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
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim());

    if (nonEmptyLines.length === 0) return code;

    const minIndent = Math.min(...nonEmptyLines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }));

    if (minIndent > 0) {
        return lines.map(line => {
            return line.trim() ? line.substring(minIndent) : line;
        }).join('\n');
    }

    return code;
};

const optimizeRulerPlacement = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const sections = doc.querySelectorAll('section');
    if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        const hrsInLastSection = lastSection.querySelectorAll('hr');
        hrsInLastSection.forEach(hr => hr.remove());

        let nextSibling = lastSection.nextElementSibling;
        while (nextSibling) {
            if (nextSibling.tagName === 'HR') {
                const toRemove = nextSibling;
                nextSibling = nextSibling.nextElementSibling;
                toRemove.remove();
            } else {
                break;
            }
        }
    }
    return doc.body.innerHTML;
};

// ------------- SECTION-BY-SECTION GENERATOR -------------

export const generateAiContent = async (formData) => {
    console.log('form data',formData);
    const { model = 'openai', language = 'english', sectionCount, sectionTypes, sectionTitles, ...contentParams } = formData;
    const modelConfig = API_CONFIG[model];
    if (!modelConfig) throw new Error(`Unsupported AI model: ${model}`);

    let htmlSections = [];
    let titlesSoFar = [];
    let failures = [];

    for (let i = 0; i < sectionCount; i++) {
        const sectionType = sectionTypes[i];
        const title = sectionTitles && sectionTitles[i];
        const sectionPrompt = createSectionPrompt({
            ...contentParams,
            sectionType,
            sectionNumber: i + 1,
            sectionTotal: sectionCount,
            title,
            titlesSoFar,
            targetAudience: contentParams.targetAudience,
            language,
            sectionLength: contentParams.sectionLength,
            tone: contentParams.tone
        });

        const maxTokens = 1200;
        const requestData = formatRequestByModel(model, sectionPrompt, maxTokens, modelConfig.temperature);
        const endpoint = typeof modelConfig.endpoint === 'function'
            ? modelConfig.endpoint(modelConfig.apiKey)
            : modelConfig.endpoint;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: modelConfig.headers(modelConfig.apiKey),
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
                failures.push(i);
                continue;
            }
            const data = await response.json();
            const content = extractContentByModel(model, data);

            const cleanedContent = cleanHtmlContent(content);
            const formattedContent = formatCodeBlocks(cleanedContent);
            htmlSections.push(formattedContent + (i < sectionCount - 1 ? '' : ''));
            titlesSoFar.push(title);

        } catch (e) {
            failures.push(i);
            continue;
        }
    }

    // Remove trailing <hr> if present (extra safety)
    let joined = htmlSections.join('\n');
    joined = optimizeRulerPlacement(joined);

    return {
        content: joined,
        failures,
        sectionTitles
    };
};


// ========== HISTORY & STORAGE (unchanged) ==========
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

const saveToLocalStorage = () => {
    try {
        localStorage.setItem('lectureGenerationHistory', JSON.stringify(generationHistory));
        console.log('Generation history saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const getGenerationHistory = () => {
    return [...generationHistory];
};

export const clearGenerationHistory = () => {
    generationHistory = [];
    localStorage.removeItem('lectureGenerationHistory');
    console.log('Generation history cleared');
};

export const getHistoryEntry = (id) => {
    return generationHistory.find(entry => entry.id === id);
};

export const deleteHistoryEntry = (id) => {
    const index = generationHistory.findIndex(entry => entry.id === id);
    if (index !== -1) {
        generationHistory.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
};

// Initialize on load
loadGenerationHistory();
