let generationHistory = [];

// Enhanced API Configuration with optimized settings
const API_CONFIG = {
    openai: {
        apiKey: 'sk-proj-ncXNHgKzJ4rzeODwe8WHT3BlbkFJV8m58WRZidY4BSD1WMkX',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o', // Using more capable model
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

// Enhanced token calculation for better content length
const calculateMaxTokens = (sectionCount, sectionLength) => {
    const tokensPerSection = {
        short: 400,   // Increased for more detailed content
        medium: 700,  // Increased for richer explanations
        long: 1000    // Increased for comprehensive coverage
    };

    const tokens = tokensPerSection[sectionLength] || 700;
    const headerFooterTokens = 300;
    const totalTokens = (sectionCount * tokens) + headerFooterTokens;
    
    // Ensure we don't exceed model limits
    return Math.min(totalTokens, 4000);
};

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

    const sectionGuidance = {
        explanation: 'Provide clear, systematic explanations with practical examples',
        examples: 'Present concrete, real-world examples with step-by-step breakdowns',
        discussion: 'Explore implications, best practices, and critical considerations',
        history: 'Cover key milestones and evolution with contextual significance',
        casestudy: 'Analyze real scenarios with detailed outcomes and lessons learned',
        comparison: 'Create clear comparisons with pros, cons, and use cases',
        exercise: 'Design practical activities with clear objectives and outcomes',
        demonstration: 'Provide step-by-step procedures with explanations',
        application: 'Show real-world implementation with practical guidance',
        analysis: 'Break down complex concepts with systematic examination',
        conclusion: 'Synthesize key insights with actionable takeaways'
    };

    const lengthMap = {
        short: '2-3 focused paragraphs with clear key points',
        medium: '4-5 well-developed paragraphs with examples and explanations',
        long: '6-8 comprehensive paragraphs with detailed coverage and multiple examples'
    };

    const audienceMap = {
        beginners: 'Use foundational language, define all terms, provide plenty of context',
        intermediate: 'Build on basic knowledge, introduce complexity gradually',
        advanced: 'Engage with sophisticated concepts, explore nuances and edge cases',
        professionals: 'Focus on practical applications, industry standards, and best practices',
        students: 'Structure for academic learning with clear objectives and assessments'
    };

    const selectedSections = sectionTypes || ['explanation', 'examples', 'discussion'];
    
    return `Create a professional lecture on: "${topic}"

TARGET AUDIENCE: ${targetAudience}
${audienceMap[targetAudience] || 'Adapt content appropriately for the audience'}

${language !== 'english' ? `LANGUAGE: Generate ALL content in ${language}` : ''}

STRUCTURE REQUIREMENTS:
- Create exactly ${sectionCount} sections
- Use these section types: ${selectedSections.join(', ')}
- Each section should contain: ${lengthMap[sectionLength]}

SECTION TYPES TO CREATE:
${selectedSections.map(type => `• ${type.toUpperCase()}: ${sectionGuidance[type]}`).join('\n')}

TONE & STYLE:
- Use ${tone} tone throughout
- Write with authority and expertise
- Include practical insights and real-world relevance
- ${includeEmojis ? 'Use relevant emojis strategically to enhance engagement' : 'No emojis'}

CONTENT STRUCTURE:
${includeHeader ? '- START with engaging introduction that hooks the learner' : '- START directly with main content sections'}
${includeFooter ? '- END with comprehensive summary and clear takeaways' : '- END with final main content section'}
- Add <hr class="section-divider" /> after each section EXCEPT the last one

CRITICAL FORMATTING RULES:
1. Use <strong> tags for ALL important concepts, key terms, and emphasis
2. Use <em> tags for ALL definitions and first mentions of terms
3. Apply bold and italic formatting liberally throughout content
4. Use proper HTML structure: <section>, <h2>, <p>, <ul>, <ol>
5. Include blockquotes for important insights: <blockquote>Pro tip or key insight</blockquote>
6. Format code with: <pre><code class="language-[lang]">code here</code></pre>

ENGAGEMENT ELEMENTS:
- Start each section with a compelling hook
- Include practical examples throughout
- Add "Pro Tips" or "Key Insights" as blockquotes
- End sections with clear takeaways
- Use questions to engage reader thinking

${additionalInstructions ? `ADDITIONAL REQUIREMENTS:\n${additionalInstructions}` : ''}

Remember: This content will be used in professional courses. Make it engaging, well-formatted, and educational excellence.`;
};


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


export const generateAiContent = async (formData) => {
    const { model = 'openai', language = 'english', replaceExisting = false, ...contentParams } = formData;

    try {
        console.log('Generating content with enhanced prompts...');
        
        const aiPrompt = createOptimizedPrompt(contentParams, language);
        console.log('Enhanced AI Prompt:', aiPrompt);
        
        const modelConfig = API_CONFIG[model];
        if (!modelConfig) {
            throw new Error(`Unsupported AI model: ${model}`);
        }

        const maxTokens = calculateMaxTokens(contentParams.sectionCount, contentParams.sectionLength);
        const requestData = formatRequestByModel(model, aiPrompt, maxTokens, modelConfig.temperature);

        const endpoint = typeof modelConfig.endpoint === 'function'
            ? modelConfig.endpoint(modelConfig.apiKey)
            : modelConfig.endpoint;

        console.log('Making API request with optimized parameters...');
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
        
        console.log('Processing and formatting generated content...');
        const cleanedContent = cleanHtmlContent(content);
        const formattedContent = formatCodeBlocks(cleanedContent);
        const finalContent = optimizeRulerPlacement(formattedContent);

        console.log('Content generation completed successfully');
        return {
            content: finalContent,
            replaceExisting,
            maxTokens: maxTokens
        };

    } catch (error) {
        console.error(`Error generating content with ${model}:`, error);
        throw error;
    }
};

// Extract content function
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

// Storage functions (keeping your existing implementation)
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