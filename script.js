// DOM Elements
const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-btn');
const resultsSection = document.getElementById('results-section');
const promptDisplay = document.getElementById('prompt-display');
const copyBtn = document.getElementById('copy-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const saveBtn = document.getElementById('save-btn');
const loadingModal = document.getElementById('loading-modal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const categoryTags = document.querySelectorAll('.category-tag');
const savedSection = document.getElementById('saved-section');
const savedPrompts = document.getElementById('saved-prompts');

// State
let currentTopic = '';
let currentPrompt = '';
let savedPromptsList = JSON.parse(localStorage.getItem('savedPrompts')) || [];

// Event Listeners
generateBtn.addEventListener('click', handleGenerate);
regenerateBtn.addEventListener('click', handleRegenerate);
copyBtn.addEventListener('click', handleCopy);
saveBtn.addEventListener('click', handleSave);
topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGenerate();
    }
});

// Category tag click handlers
categoryTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const topic = tag.getAttribute('data-topic');
        topicInput.value = topic;
        handleGenerate();
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSavedPrompts();
    if (savedPromptsList.length > 0) {
        showSavedSection();
    }
});

// Main Functions
async function handleGenerate() {
    const topic = topicInput.value.trim();
    
    if (!topic) {
        showToast('Please enter a topic first!', 'error');
        return;
    }
    
    currentTopic = topic;
    showLoading(true);
    
    try {
        const prompt = await generateAIPrompt(topic);
        currentPrompt = prompt;
        displayPrompt(prompt);
        showResults();
        showToast('Prompt generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating prompt:', error);
        showToast('Failed to generate prompt. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegenerate() {
    if (!currentTopic) return;
    
    showLoading(true);
    
    try {
        const prompt = await generateAIPrompt(currentTopic);
        currentPrompt = prompt;
        displayPrompt(prompt);
        showToast('New prompt generated!', 'success');
    } catch (error) {
        console.error('Error regenerating prompt:', error);
        showToast('Failed to regenerate prompt. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function handleCopy() {
    if (!currentPrompt) return;
    
    navigator.clipboard.writeText(currentPrompt).then(() => {
        showToast('Prompt copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentPrompt;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Prompt copied to clipboard!', 'success');
    });
}

function handleSave() {
    if (!currentTopic || !currentPrompt) return;
    
    const savedPrompt = {
        id: Date.now(),
        topic: currentTopic,
        prompt: currentPrompt,
        timestamp: new Date().toLocaleString()
    };
    
    savedPromptsList.unshift(savedPrompt);
    localStorage.setItem('savedPrompts', JSON.stringify(savedPromptsList));
    
    loadSavedPrompts();
    showSavedSection();
    showToast('Prompt saved successfully!', 'success');
}

// AI Prompt Generation
async function generateAIPrompt(topic) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // AI prompt templates based on topic
    const promptTemplates = {
        'creative writing': [
            `Write a compelling creative piece about "${topic}". Focus on vivid imagery, emotional depth, and engaging narrative flow. Include sensory details and create a unique voice that draws readers in.`,
            `Create an imaginative story centered around "${topic}". Develop rich characters, build tension, and craft a satisfying resolution that leaves readers thinking.`,
            `Compose a creative piece exploring "${topic}" from an unexpected angle. Use metaphor, symbolism, and innovative language to create a memorable reading experience.`
        ],
        'business strategy': [
            `Develop a comprehensive business strategy for "${topic}". Include market analysis, competitive positioning, growth opportunities, and implementation roadmap.`,
            `Create a strategic plan to address "${topic}" in business. Consider market trends, customer needs, resource allocation, and risk management.`,
            `Design a business strategy framework for "${topic}". Focus on value proposition, target market, competitive advantage, and sustainable growth.`
        ],
        'coding help': [
            `Provide a detailed coding solution for "${topic}". Include code examples, best practices, error handling, and performance considerations.`,
            `Create a programming guide for "${topic}". Cover implementation steps, common pitfalls, testing strategies, and optimization techniques.`,
            `Develop a coding approach for "${topic}". Focus on clean code principles, documentation, scalability, and maintainability.`
        ],
        'art generation': [
            `Generate an artistic concept for "${topic}". Describe visual elements, color palette, composition, mood, and artistic style to create compelling artwork.`,
            `Create an art prompt for "${topic}". Focus on unique perspective, emotional impact, technical execution, and creative interpretation.`,
            `Design an artistic vision for "${topic}". Include visual references, artistic techniques, color theory, and creative direction.`
        ],
        'marketing copy': [
            `Write compelling marketing copy for "${topic}". Focus on benefits, emotional appeal, clear call-to-action, and persuasive language that converts.`,
            `Create marketing content for "${topic}". Emphasize unique value proposition, target audience needs, and compelling reasons to engage.`,
            `Develop marketing messaging for "${topic}". Use persuasive techniques, benefit-focused language, and strong calls-to-action.`
        ],
        'academic research': [
            `Formulate a research question and methodology for studying "${topic}". Include literature review approach, data collection methods, and analysis framework.`,
            `Design a research study on "${topic}". Consider research design, sampling strategy, data analysis, and ethical considerations.`,
            `Create a research framework for "${topic}". Focus on theoretical foundation, research objectives, methodology, and expected outcomes.`
        ],
        'social media': [
            `Create engaging social media content for "${topic}". Focus on platform-specific optimization, trending elements, and audience engagement strategies.`,
            `Develop social media strategy for "${topic}". Include content themes, posting schedule, audience targeting, and engagement metrics.`,
            `Design social media campaign for "${topic}". Focus on viral potential, shareability, brand consistency, and call-to-action.`
        ],
        'product description': [
            `Write a compelling product description for "${topic}". Highlight key features, benefits, target audience, and unique selling points.`,
            `Create product marketing copy for "${topic}". Focus on customer pain points, solution benefits, and persuasive language.`,
            `Develop product messaging for "${topic}". Emphasize value proposition, competitive advantages, and customer outcomes.`
        ]
    };
    
    // Find matching template category
    let selectedTemplates = promptTemplates['creative writing']; // default
    
    for (const [category, templates] of Object.entries(promptTemplates)) {
        if (topic.toLowerCase().includes(category.toLowerCase()) || 
            category.toLowerCase().includes(topic.toLowerCase())) {
            selectedTemplates = templates;
            break;
        }
    }
    
    // Return random template from matching category
    return selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
}

// UI Functions
function displayPrompt(prompt) {
    promptDisplay.textContent = prompt;
}

function showResults() {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showLoading(show) {
    if (show) {
        loadingModal.style.display = 'flex';
    } else {
        loadingModal.style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Update toast styling based on type
    toast.className = `toast ${type}`;
    if (type === 'error') {
        toast.style.background = '#dc3545';
    } else {
        toast.style.background = '#4caf50';
    }
    
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function loadSavedPrompts() {
    savedPrompts.innerHTML = '';
    
    if (savedPromptsList.length === 0) {
        savedPrompts.innerHTML = '<p style="text-align: center; color: #666;">No saved prompts yet.</p>';
        return;
    }
    
    savedPromptsList.forEach(savedPrompt => {
        const promptElement = document.createElement('div');
        promptElement.className = 'saved-prompt';
        promptElement.innerHTML = `
            <div class="saved-prompt-header">
                <span class="saved-prompt-topic">${savedPrompt.topic}</span>
                <button class="delete-saved" onclick="deleteSavedPrompt(${savedPrompt.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="saved-prompt-text">${savedPrompt.prompt}</div>
            <small style="color: #999; display: block; margin-top: 10px;">${savedPrompt.timestamp}</small>
        `;
        savedPrompts.appendChild(promptElement);
    });
}

function deleteSavedPrompt(id) {
    savedPromptsList = savedPromptsList.filter(prompt => prompt.id !== id);
    localStorage.setItem('savedPrompts', JSON.stringify(savedPromptsList));
    loadSavedPrompts();
    
    if (savedPromptsList.length === 0) {
        savedSection.style.display = 'none';
    }
    
    showToast('Prompt deleted successfully!', 'success');
}

function showSavedSection() {
    savedSection.style.display = 'block';
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to category tags
    categoryTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'scale(1)';
        });
    });
    
    // Add focus effects to input
    topicInput.addEventListener('focus', () => {
        topicInput.parentElement.style.transform = 'scale(1.02)';
    });
    
    topicInput.addEventListener('blur', () => {
        topicInput.parentElement.style.transform = 'scale(1)';
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
    }
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
    }
    
    // Escape to close loading modal
    if (e.key === 'Escape') {
        showLoading(false);
    }
});
