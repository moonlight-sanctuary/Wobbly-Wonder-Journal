// Sidebar Manager Class - Handles mutual exclusivity between sidebars
class SidebarManager {
    constructor(leftToggle, rightToggle) {
        this.leftToggle = leftToggle;
        this.rightToggle = rightToggle;
        this.currentSidebar = null; // 'left', 'right', or null

        console.log('SidebarManager constructor called with:', {
            leftToggle: leftToggle,
            rightToggle: rightToggle,
            leftToggleExists: !!leftToggle,
            rightToggleExists: !!rightToggle
        });

        if (!leftToggle || !rightToggle) {
            console.error('SidebarManager: Missing toggle buttons!', { leftToggle, rightToggle });
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.leftToggle || !this.rightToggle) {
            console.error('Cannot setup event listeners: missing toggle buttons');
            return;
        }

        this.leftToggle.addEventListener('click', (e) => {
            console.log('Left toggle clicked!');
            e.preventDefault();
            this.toggleSidebar('left');
        });

        this.rightToggle.addEventListener('click', (e) => {
            console.log('Right toggle clicked!');
            e.preventDefault();
            this.toggleSidebar('right');
        });
        
        console.log('Event listeners attached to sidebar toggles');
    }

    toggleSidebar(side) {
        if (this.currentSidebar === side) {
            // Close the current sidebar
            this.closeSidebar(side);
        } else {
            // Open the requested sidebar (this will close the other if open)
            this.openSidebar(side);
        }
    }

    openSidebar(side) {
        console.log(`Opening ${side} sidebar`);
        
        // Close the other sidebar if it's open
        if (this.currentSidebar && this.currentSidebar !== side) {
            this.closeSidebar(this.currentSidebar);
        }

        // Open the requested sidebar
        document.body.classList.add(`${side}-open`);
        this.currentSidebar = side;
        
        console.log(`Body classes after opening ${side}:`, document.body.className);

        // Update toggle button states
        this.updateToggleStates();
    }

    closeSidebar(side) {
        document.body.classList.remove(`${side}-open`);
        if (this.currentSidebar === side) {
            this.currentSidebar = null;
        }

        // Update toggle button states
        this.updateToggleStates();
    }

    updateToggleStates() {
        // Update visual states of toggle buttons if needed
        // This can be extended for visual feedback
    }

    getCurrentSidebar() {
        return this.currentSidebar;
    }

    isSidebarOpen(side) {
        return this.currentSidebar === side;
    }
}

// Theme Manager Class - Handles theme switching and customization
class ThemeManager {
    constructor() {
        this.currentTheme = 'warm';
        this.currentMode = 'light';
        this.themes = {
            warm: {
                name: 'Warm',
                description: 'Cozy and inviting',
                icon: '🔥',
                colors: {
                    light: { primary: '#ed8441', background: '#fef7f0', surface: '#ffffff' },
                    dark: { primary: '#f1a169', background: '#000000', surface: '#111111' }
                }
            },
            cool: {
                name: 'Cool',
                description: 'Professional and calming',
                icon: '❄️',
                colors: {
                    light: { primary: '#3b82f6', background: '#f0f9ff', surface: '#ffffff' },
                    dark: { primary: '#60a5fa', background: '#000000', surface: '#0f172a' }
                }
            },
            minimal: {
                name: 'Minimal',
                description: 'Clean and distraction-free',
                icon: '⚪',
                colors: {
                    light: { primary: '#374151', background: '#ffffff', surface: '#f9fafb' },
                    dark: { primary: '#d1d5db', background: '#000000', surface: '#111827' }
                }
            }
        };

        this.loadPreferences();
        this.initializeTheme();
        this.setupSystemThemeListener();
    }

    initializeTheme() {
        // Set initial theme attributes on document
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.documentElement.setAttribute('data-mode', this.currentMode);

        // Apply theme immediately
        this.applyTheme(this.currentTheme, this.currentMode);
    }

    setTheme(themeName, mode = null) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found`);
            return;
        }

        this.currentTheme = themeName;
        if (mode) {
            this.currentMode = mode;
        }

        this.applyTheme(themeName, this.currentMode);
        this.savePreferences();
        this.notifyThemeChange();
    }

    toggleMode() {
        const newMode = this.currentMode === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme, newMode);
    }

    applyTheme(themeName, mode) {
        // Update document attributes for CSS targeting
        document.documentElement.setAttribute('data-theme', themeName);
        document.documentElement.setAttribute('data-mode', mode);

        // Add transition class for smooth changes
        document.documentElement.classList.add('theme-transitioning');

        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    }

    savePreferences() {
        try {
            const preferences = {
                theme: this.currentTheme,
                mode: this.currentMode
            };
            localStorage.setItem('themePreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save theme preferences:', error);
        }
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('themePreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.currentTheme = preferences.theme || 'warm';
                this.currentMode = preferences.mode || this.getSystemPreference();
            } else {
                // Use system preference for initial mode
                this.currentMode = this.getSystemPreference();
            }
        } catch (error) {
            console.error('Failed to load theme preferences:', error);
            // Use defaults
            this.currentTheme = 'warm';
            this.currentMode = this.getSystemPreference();
        }
    }

    getSystemPreference() {
        // Check system preference for dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setupSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const saved = localStorage.getItem('themePreferences');
                if (!saved) {
                    const newMode = e.matches ? 'dark' : 'light';
                    this.setTheme(this.currentTheme, newMode);
                }
            });
        }
    }

    notifyThemeChange() {
        // Update UI elements
        this.updateThemeSelector();
        this.updateModeToggle();

        // Dispatch custom event for components that need to react to theme changes
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: this.currentTheme,
                mode: this.currentMode
            }
        });
        document.dispatchEvent(event);
    }

    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            mode: this.currentMode,
            info: this.themes[this.currentTheme]
        };
    }

    getAvailableThemes() {
        return this.themes;
    }

    showToast(message, type = 'info', icon = '✨') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    initializeUI() {
        this.createThemeSelector();
        this.setupEventListeners();
    }

    createThemeSelector() {
        const themeOptions = document.getElementById('themeOptions');
        if (!themeOptions) return;

        // Clear existing options
        themeOptions.innerHTML = '';

        // Create theme cards
        Object.entries(this.themes).forEach(([key, theme]) => {
            const themeCard = document.createElement('div');
            themeCard.className = `theme-card ${key === this.currentTheme ? 'active' : ''}`;
            themeCard.dataset.theme = key;

            const colors = theme.colors[this.currentMode];
            themeCard.innerHTML = `
                <div class="theme-preview">
                    <div class="color-dot" style="background-color: ${colors.primary}"></div>
                </div>
                <div class="theme-info">
                    <div class="theme-name">${theme.icon} ${theme.name}</div>
                    <div class="theme-description">${theme.description}</div>
                </div>
            `;

            themeOptions.appendChild(themeCard);
        });
    }

    setupEventListeners() {
        // Theme card clicks
        document.addEventListener('click', (e) => {
            const themeCard = e.target.closest('.theme-card');
            if (themeCard) {
                const themeName = themeCard.dataset.theme;
                const theme = this.themes[themeName];
                this.setTheme(themeName);
                this.showToast(`Switched to ${theme.name} theme`, 'success', theme.icon);
            }
        });

        // Mode toggle clicks
        document.addEventListener('click', (e) => {
            const modeBtn = e.target.closest('.mode-btn');
            if (modeBtn) {
                const mode = modeBtn.dataset.mode;
                this.setTheme(this.currentTheme, mode);
                const icon = mode === 'dark' ? '🌙' : '☀️';
                const modeName = mode === 'dark' ? 'Dark' : 'Light';
                this.showToast(`Switched to ${modeName} mode`, 'success', icon);
            }
        });
    }

    updateThemeSelector() {
        // Update active theme card
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === this.currentTheme);
        });

        // Recreate theme cards with updated colors
        this.createThemeSelector();
    }

    updateModeToggle() {
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
        });
    }
}

// AI Service Class - Handles AI communication and status monitoring
class AIService {
    constructor() {
        this.status = 'disconnected';
        this.capabilities = [];
        this.ollamaEndpoint = 'http://localhost:11434';
        this.model = this.loadSelectedModel();
        this.statusCallbacks = [];
        this.isChecking = false;

        // Available models with descriptions - Latest and best options
        this.availableModels = {
            'qwen3:0.6b': {
                name: 'Qwen3 0.6B',
                description: 'Latest Qwen model, ultra-fast and efficient',
                size: '0.4GB',
                speed: 'Ultra Fast',
                category: 'Latest'
            },
            'qwen3:1.7b': {
                name: 'Qwen3 1.7B',
                description: 'Latest Qwen with excellent reasoning',
                size: '1.0GB',
                speed: 'Very Fast',
                category: 'Latest'
            },
            'qwen3:4b': {
                name: 'Qwen3 4B',
                description: 'High-quality latest generation model',
                size: '2.4GB',
                speed: 'Fast',
                category: 'Latest'
            },
            'gemma3:1b': {
                name: 'Gemma3 1B',
                description: 'Google\'s latest, most efficient model',
                size: '0.7GB',
                speed: 'Ultra Fast',
                category: 'Latest'
            },
            'gemma3:4b': {
                name: 'Gemma3 4B',
                description: 'Latest Gemma with superior capabilities',
                size: '2.5GB',
                speed: 'Fast',
                category: 'Latest'
            },
            'deepseek-r1:1.5b': {
                name: 'DeepSeek-R1 1.5B',
                description: 'Thinking model with reasoning chains',
                size: '0.9GB',
                speed: 'Fast',
                category: 'Thinking'
            },
            'deepseek-r1:7b': {
                name: 'DeepSeek-R1 7B',
                description: 'Advanced thinking model, excellent reasoning',
                size: '4.1GB',
                speed: 'Medium',
                category: 'Thinking'
            },
            'gpt-oss:20b': {
                name: 'GPT-OSS 20B',
                description: 'OpenAI-style thinking model, very capable',
                size: '12GB',
                speed: 'Slow',
                category: 'Thinking'
            },
            'llama3.1:8b': {
                name: 'Llama 3.1 8B',
                description: 'Meta\'s proven model, reliable and fast',
                size: '4.7GB',
                speed: 'Medium',
                category: 'Reliable'
            },
            'llama3.2:1b': {
                name: 'Llama 3.2 1B',
                description: 'Compact and efficient (current default)',
                size: '1.3GB',
                speed: 'Very Fast',
                category: 'Reliable'
            }
        };
    }

    loadSelectedModel() {
        try {
            const saved = localStorage.getItem('selectedAIModel');
            return saved || 'llama3.2:1b';
        } catch (error) {
            return 'llama3.2:1b';
        }
    }

    async setModel(modelName) {
        if (this.availableModels[modelName]) {
            this.model = modelName;
            localStorage.setItem('selectedAIModel', modelName);

            // Show downloading status if model needs to be downloaded
            this.updateStatus('downloading');

            try {
                // Try to pull the model if it doesn't exist
                await this.ensureModelExists(modelName);
                // Re-check status with new model
                await this.checkOllamaStatus();

                // Show success toast if connected
                if (this.status === 'connected') {
                    const model = this.getCurrentModel();
                    // Find theme manager through window.journal
                    if (window.journal && window.journal.themeManager) {
                        window.journal.themeManager.showToast(`${model.name} ready!`, 'success', '✅');
                    }
                }
            } catch (error) {
                console.error('Error setting model:', error);
                this.updateStatus('model-missing');

                // Show error toast
                if (window.journal && window.journal.themeManager) {
                    window.journal.themeManager.showToast('Model download failed', 'error', '❌');
                }
            }
        }
    }

    async ensureModelExists(modelName) {
        try {
            // First check if model exists
            const response = await fetch(`${this.ollamaEndpoint}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });

            if (response.ok) {
                const data = await response.json();
                const hasModel = data.models?.some(model =>
                    model.name.includes(modelName.split(':')[0]) &&
                    model.name.includes(modelName.split(':')[1])
                );

                if (!hasModel) {
                    // Model doesn't exist, try to pull it
                    console.log(`Downloading model: ${modelName}`);

                    // Show downloading toast
                    if (window.journal && window.journal.themeManager) {
                        window.journal.themeManager.showToast(`Downloading ${modelName}...`, 'info', '⬇️');
                    }

                    const pullResponse = await fetch(`${this.ollamaEndpoint}/api/pull`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: modelName })
                    });

                    if (!pullResponse.ok) {
                        throw new Error(`Failed to download model: ${modelName}`);
                    }

                    // Wait a bit for the download to start
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    console.log(`Model download initiated: ${modelName}`);
                }
            }
        } catch (error) {
            console.error('Error ensuring model exists:', error);
            throw error;
        }
    }

    getAvailableModels() {
        return this.availableModels;
    }

    getCurrentModel() {
        return {
            id: this.model,
            ...this.availableModels[this.model]
        };
    }

    async checkOllamaStatus() {
        if (this.isChecking) return this.status;

        this.isChecking = true;
        this.updateStatus('checking');

        try {
            // Check if Ollama is running
            const response = await fetch(`${this.ollamaEndpoint}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });

            if (response.ok) {
                const data = await response.json();
                const hasModel = data.models?.some(model =>
                    model.name.includes(this.model.split(':')[0]) &&
                    model.name.includes(this.model.split(':')[1])
                );

                if (hasModel) {
                    this.updateStatus('connected');
                    this.capabilities = ['Chat with AI', 'Explore Patterns', 'Reflect on Entries'];
                } else {
                    this.updateStatus('model-missing');
                }
            } else {
                this.updateStatus('disconnected');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                this.updateStatus('timeout');
            } else {
                this.updateStatus('not-installed');
            }
        }

        this.isChecking = false;
        return this.status;
    }

    updateStatus(status) {
        this.status = status;
        this.statusCallbacks.forEach(callback => callback(status));

        // Update UI status display
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            const text = statusElement.querySelector('span');

            if (indicator && text) {
                switch (status) {
                    case 'connected':
                        indicator.className = 'status-indicator connected';
                        text.textContent = `AI: ${this.getCurrentModel().name}`;
                        break;
                    case 'downloading':
                        indicator.className = 'status-indicator downloading';
                        text.textContent = 'AI: Downloading model...';
                        break;
                    case 'model-missing':
                        indicator.className = 'status-indicator warning';
                        text.textContent = 'AI: Model not found';
                        break;
                    case 'checking':
                        indicator.className = 'status-indicator checking';
                        text.textContent = 'AI: Checking...';
                        break;
                    default:
                        indicator.className = 'status-indicator disconnected';
                        text.textContent = 'AI: Disconnected';
                }
            }
        }
    }

    onStatusChange(callback) {
        this.statusCallbacks.push(callback);
    }



    // Entry title generation removed - focusing on chat-based AI interaction

    async chatWithEntries(query, entries, currentEntryId = null) {
        if (this.status !== 'connected') {
            throw new Error('AI service not available');
        }

        // Smart context creation that includes all entries but manages size
        const allEntriesContext = this.createSmartContext(query, entries);
        
        // Add current entry context if available
        let currentEntryContext = '';
        if (currentEntryId) {
            const currentEntry = entries.find(e => e.id === currentEntryId);
            if (currentEntry) {
                const date = new Date(currentEntry.date).toLocaleDateString();
                currentEntryContext = `\n\nCURRENT ENTRY (what they're viewing now):\n[${date}] ${currentEntry.content}`;
            }
        }

        const prompt = `You are a thoughtful reflection companion. Someone has shared their personal journal with you and is asking for insights. Be supportive and helpful without being overly emotional.

${allEntriesContext}${currentEntryContext}

Their question: ${query}

Please provide a helpful, supportive response that:
- Offers genuine insights and perspectives
- Acknowledges patterns or growth you notice
- Provides practical reflection questions when appropriate
- References specific entries when relevant: "In your entry from [date]..."
- Maintains a warm but professional tone
- Focuses on their personal development and self-awareness
- Avoids being overly sentimental or dramatic

Your thoughtful response:`;

        const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate response');
        }

        const data = await response.json();
        return data.response.trim();
    }

    createSmartContext(query, entries) {
        if (entries.length === 0) {
            return "No journal entries found.";
        }

        // Create a comprehensive but manageable context
        let context = `COMPLETE JOURNAL HISTORY (${entries.length} total entries):\n\n`;

        // For queries about specific topics, try to find relevant entries
        const queryLower = query.toLowerCase();
        const relevantEntries = [];
        const otherEntries = [];

        // Categorize entries based on relevance to the query
        entries.forEach(entry => {
            const contentLower = entry.content.toLowerCase();
            const isRelevant = this.isEntryRelevant(queryLower, contentLower);

            if (isRelevant) {
                relevantEntries.push(entry);
            } else {
                otherEntries.push(entry);
            }
        });

        // Include all relevant entries with full content
        if (relevantEntries.length > 0) {
            context += "MOST RELEVANT ENTRIES:\n";
            relevantEntries.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString();
                const preview = entry.content.length > 500 ?
                    entry.content.substring(0, 500) + '...' :
                    entry.content;
                context += `[${date}] ${preview}\n\n`;
            });
        }

        // Include recent entries (last 15) with moderate detail
        const recentEntries = otherEntries.slice(0, 15);
        if (recentEntries.length > 0) {
            context += "RECENT ENTRIES:\n";
            recentEntries.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString();
                const preview = entry.content.substring(0, 300);
                context += `[${date}] ${preview}${entry.content.length > 300 ? '...' : ''}\n\n`;
            });
        }

        // Include older entries with brief summaries
        const olderEntries = otherEntries.slice(15);
        if (olderEntries.length > 0) {
            context += `OLDER ENTRIES SUMMARY (${olderEntries.length} entries):\n`;

            // Group older entries by month for better organization
            const monthlyGroups = this.groupEntriesByMonth(olderEntries);

            Object.entries(monthlyGroups).forEach(([month, monthEntries]) => {
                context += `${month}: ${monthEntries.length} entries - `;
                const themes = this.extractThemes(monthEntries);
                context += `Main themes: ${themes.join(', ')}\n`;
            });
        }

        return context;
    }

    isEntryRelevant(queryLower, contentLower) {
        // Extract key terms from the query
        const queryTerms = queryLower
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 2)
            .filter(term => !['the', 'and', 'but', 'for', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'what', 'when', 'where', 'why', 'how', 'about', 'with', 'from', 'they', 'them', 'their', 'this', 'that', 'these', 'those'].includes(term));

        // Check if any query terms appear in the content
        return queryTerms.some(term => contentLower.includes(term));
    }

    groupEntriesByMonth(entries) {
        const groups = {};

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(entry);
        });

        return groups;
    }

    extractThemes(entries) {
        // Simple theme extraction based on common words
        const wordCounts = {};
        const commonWords = new Set(['the', 'and', 'but', 'for', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'with', 'from', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'very', 'just', 'like', 'more', 'some', 'time', 'only', 'know', 'think', 'also', 'back', 'after', 'use', 'two', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']);

        entries.forEach(entry => {
            const words = entry.content.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 3 && !commonWords.has(word));

            words.forEach(word => {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            });
        });

        // Return top themes
        return Object.entries(wordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([word]) => word);
    }


}

// Simple Journal App - Extracted JavaScript
class SimpleJournal {
    constructor() {
        this.entries = this.loadEntries();
        this.currentEntryId = null;
        this.saveTimeout = null;
        this.typingTimeout = null;
        this.timeUpdateInterval = null;
        this.lastSavedTimestamp = null;
        this.sidebarManager = null; // Will be initialized in setupElements
        this.aiService = new AIService();
        this.themeManager = new ThemeManager();
        this.chatInterface = null;

        this.init();
    }

    init() {
        console.log('🚀 Starting Simple Journal...');

        // Add loading class to body
        document.body.classList.add('loading');

        this.setupElements();
        this.setupEventListeners();
        this.renderEntries();
        this.updateWordCount();

        // Initialize AI service
        this.initializeAIService();

        // Welcome overlay removed - cleaner startup

        // Remove loading class after a short delay
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 200);

        console.log('✅ Simple Journal ready!');
    }

    setupElements() {
        // Core elements
        this.textarea = document.getElementById('journalEntry');
        this.wordCount = document.getElementById('wordCount');
        this.entryList = document.getElementById('entryList');
        this.searchInput = document.getElementById('searchInput');
        // Welcome overlay removed - no longer needed
        this.writingContainer = document.querySelector('.writing-container');

        // Autosave elements
        this.autosaveDot = document.getElementById('autosaveDot');
        this.autosaveStatus = document.getElementById('autosaveStatus');
        this.lastSavedTime = document.getElementById('lastSavedTime');

        // Initialize enhanced sidebar management - get elements fresh
        setTimeout(() => {
            this.leftToggle = document.getElementById('leftToggle');
            this.rightToggle = document.getElementById('rightToggle');
            
            console.log('Fresh element lookup:', {
                leftToggle: this.leftToggle,
                rightToggle: this.rightToggle,
                leftToggleId: this.leftToggle?.id,
                rightToggleId: this.rightToggle?.id
            });
            
            if (this.leftToggle && this.rightToggle) {
                this.sidebarManager = new SidebarManager(this.leftToggle, this.rightToggle);
                console.log('SidebarManager created successfully:', this.sidebarManager);
            } else {
                console.error('Toggle buttons not found!');
            }
        }, 100);

        // Buttons
        this.newBtn = document.getElementById('newBtn');
        this.floatingNewBtn = document.getElementById('floatingNewBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.aiChatBtn = document.getElementById('aiChatBtn');
        this.aiStatus = document.getElementById('aiStatus');
        this.aiCapabilities = document.getElementById('aiCapabilities');

        // Entry summary elements removed - no longer using summarization

        // Floating chat interface elements
        this.floatingAIChat = document.getElementById('floatingAIChat');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');
        this.chatCloseBtn = document.getElementById('chatCloseBtn');

        // Test panel button
        this.testToggleBtn = document.getElementById('testToggleBtn');

        // Initialize theme UI
        this.themeManager.initializeUI();

        // Initialize AI model selector
        this.initializeModelSelector();
    }

    setupEventListeners() {
        // Welcome overlay removed - no longer needed

        // Focus textarea on main content click
        document.querySelector('.main-content').addEventListener('click', () => {
            this.textarea.focus();
        });

        // Sidebar toggles are now handled by SidebarManager

        // Textarea
        this.textarea.addEventListener('input', () => {
            this.updateWordCount();
            this.autoSave();

            // Add typing indicator
            this.writingContainer?.classList.add('typing');
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.writingContainer?.classList.remove('typing');
            }, 1000);
        });

        this.textarea.addEventListener('focus', () => {
            this.writingContainer?.classList.add('focused');
        });

        this.textarea.addEventListener('blur', () => {
            this.writingContainer?.classList.remove('focused');
            // No automatic welcome screen reappearing - less annoying UX
        });

        // Buttons
        this.newBtn.addEventListener('click', () => this.newEntry());
        this.floatingNewBtn.addEventListener('click', () => this.newEntry());
        this.exportBtn.addEventListener('click', () => this.exportEntries());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.handleImport(e));
        this.aiChatBtn.addEventListener('click', () => this.toggleAIChat());
        this.testToggleBtn.addEventListener('click', () => this.toggleTestPanel());


        // Chat interface
        this.chatSendBtn.addEventListener('click', () => this.sendChatMessage());
        this.chatCloseBtn.addEventListener('click', () => this.closeAIChat());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Search
        this.searchInput.addEventListener('input', () => this.filterEntries());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '[') {
                e.preventDefault();
                this.sidebarManager.toggleSidebar('left');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === ']') {
                e.preventDefault();
                this.sidebarManager.toggleSidebar('right');
            }
        });
    }

    updateWordCount() {
        const text = this.textarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        this.wordCount.textContent = `${words} words`;
    }

    autoSave() {
        // Show saving status
        this.updateAutosaveStatus('saving');

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveCurrentEntry();
        }, 1000);
    }

    saveCurrentEntry() {
        const content = this.textarea.value.trim();
        if (!content) {
            this.updateAutosaveStatus('saved');
            return;
        }

        const now = new Date();
        const entry = {
            id: this.currentEntryId || this.generateId(),
            content: content,
            date: now.toISOString(),
            wordCount: content.split(/\s+/).length,
            // summary field removed - focusing on chat-based AI interaction
            title: null // Short title for entry list
        };

        // Update or add entry
        const existingIndex = this.entries.findIndex(e => e.id === entry.id);
        if (existingIndex >= 0) {
            // Preserve existing title when updating content
            const existingEntry = this.entries[existingIndex];
            entry.title = existingEntry.title;
            this.entries[existingIndex] = entry;
        } else {
            this.entries.unshift(entry);
        }

        this.currentEntryId = entry.id;
        this.saveEntries();
        this.renderEntries();

        // Update autosave status
        this.updateAutosaveStatus('saved', now);
    }

    updateAutosaveStatus(status, timestamp = null) {
        if (!this.autosaveDot || !this.autosaveStatus || !this.lastSavedTime) return;

        if (status === 'saving') {
            this.autosaveDot.classList.add('saving');
            this.autosaveStatus.textContent = 'Saving...';
            this.lastSavedTime.textContent = '';
        } else if (status === 'saved') {
            this.autosaveDot.classList.remove('saving');
            this.autosaveStatus.textContent = 'Saved';

            if (timestamp) {
                this.lastSavedTimestamp = timestamp;
                this.updateSavedTimeDisplay();

                // Update the time display every minute
                if (this.timeUpdateInterval) {
                    clearInterval(this.timeUpdateInterval);
                }
                this.timeUpdateInterval = setInterval(() => {
                    this.updateSavedTimeDisplay();
                }, 60000); // Update every minute
            }
        }
    }

    updateSavedTimeDisplay() {
        if (!this.lastSavedTimestamp || !this.lastSavedTime) return;

        const now = new Date();
        const diffMs = now - this.lastSavedTimestamp;
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 1) {
            this.lastSavedTime.textContent = 'just now';
        } else if (diffMinutes < 60) {
            this.lastSavedTime.textContent = `${diffMinutes} min ago`;
        } else {
            const timeString = this.lastSavedTimestamp.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            this.lastSavedTime.textContent = `at ${timeString}`;
        }
    }

    newEntry() {
        this.textarea.value = '';
        this.currentEntryId = null;
        this.updateWordCount();
        this.textarea.focus();

    }

    loadEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            this.textarea.value = entry.content;
            this.currentEntryId = entry.id;
            this.updateWordCount();
            this.textarea.focus();


        }
    }

    renderEntries() {
        const filteredEntries = this.getFilteredEntries();
        const emptyState = document.getElementById('emptyState');

        if (filteredEntries.length === 0) {
            if (this.entries.length === 0) {
                // No entries at all
                emptyState.innerHTML = `
                    <div class="empty-icon">📝</div>
                    <p>No entries yet</p>
                    <span>Start writing to see your entries here</span>
                `;
            } else {
                // No search results
                emptyState.innerHTML = `
                    <div class="empty-icon">🔍</div>
                    <p>No matching entries</p>
                    <span>Try a different search term</span>
                `;
            }
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Clear and rebuild entry list
        const entryContainer = this.entryList;
        const existingEntries = entryContainer.querySelectorAll('.entry-group, .entry-item');
        existingEntries.forEach(entry => entry.remove());

        // Group entries by date
        const groupedEntries = this.groupEntriesByDate(filteredEntries);

        Object.entries(groupedEntries).forEach(([dateKey, entries]) => {
            // Create date group header
            const dateGroup = document.createElement('div');
            dateGroup.className = 'entry-group';

            const dateHeader = document.createElement('div');
            dateHeader.className = 'entry-date-header';
            dateHeader.textContent = dateKey;
            dateGroup.appendChild(dateHeader);

            // Add entries for this date
            entries.forEach(entry => {
                const div = document.createElement('div');
                div.className = 'entry-item';

                // Show AI-generated title if available, otherwise show content preview
                const displayContent = entry.title ?
                    `<div class="entry-title">
                        ${entry.title}
                        <button class="entry-title-remove" data-entry-id="${entry.id}" title="Remove title">×</button>
                    </div>
                    <div class="entry-preview">${this.truncateText(entry.content, 60)}</div>` :
                    `<div class="entry-preview">${this.truncateText(entry.content, 100)}</div>`;

                div.innerHTML = `
                    <div class="entry-header">
                        <div class="entry-actions">
                            <button class="entry-delete-btn" data-entry-id="${entry.id}" title="Delete entry">×</button>
                        </div>
                    </div>
                    ${displayContent}
                `;

                // Add click handler for loading entry (but not on action buttons)
                div.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('entry-delete-btn') &&
                        !e.target.classList.contains('entry-title-remove')) {
                        this.loadEntry(entry.id);
                    }
                });

                // Add delete handler
                const deleteBtn = div.querySelector('.entry-delete-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteEntry(entry.id);
                });



                // Add title remove handler
                const titleRemoveBtn = div.querySelector('.entry-title-remove');
                if (titleRemoveBtn) {
                    titleRemoveBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeEntryTitle(entry.id);
                    });
                }

                dateGroup.appendChild(div);
            });

            entryContainer.appendChild(dateGroup);
        });
    }

    groupEntriesByDate(entries) {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            let dateKey;

            if (this.isSameDay(entryDate, today)) {
                dateKey = 'Today';
            } else if (this.isSameDay(entryDate, yesterday)) {
                dateKey = 'Yesterday';
            } else {
                dateKey = entryDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: entryDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(entry);
        });

        return groups;
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    getFilteredEntries() {
        const query = this.searchInput.value.toLowerCase().trim();
        if (!query) return this.entries;

        return this.entries.filter(entry =>
            entry.content.toLowerCase().includes(query) ||
            new Date(entry.date).toLocaleDateString().includes(query)
        );
    }

    filterEntries() {
        this.renderEntries();
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    exportEntries() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            entries: this.entries
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.entries && Array.isArray(data.entries)) {
                    // Merge entries
                    data.entries.forEach(entry => {
                        if (!this.entries.find(e => e.id === entry.id)) {
                            this.entries.push(entry);
                        }
                    });

                    // Sort by date
                    this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

                    this.saveEntries();
                    this.renderEntries();
                    alert(`Imported ${data.entries.length} entries successfully!`);
                }
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // generateAISummary method removed - focusing on chat-based AI interaction

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadEntries() {
        try {
            const stored = localStorage.getItem('simpleJournalEntries');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading entries:', error);
            return [];
        }
    }

    saveEntries() {
        try {
            localStorage.setItem('simpleJournalEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
        }
    }

    updateAIStatus(status) {
        const statusElement = this.aiStatus.querySelector('span');
        if (statusElement) {
            statusElement.textContent = `AI: ${status}`;
        }

        // Update CSS classes for styling
        this.aiStatus.classList.remove('connected', 'generating', 'disconnected');

        if (status.toLowerCase().includes('connected')) {
            this.aiStatus.classList.add('connected');
        } else if (status.toLowerCase().includes('generating')) {
            this.aiStatus.classList.add('generating');
        } else {
            this.aiStatus.classList.add('disconnected');
        }
    }

    // Welcome screen methods removed - no longer needed

    checkWelcomeScreenVisibility() {
        // Welcome screen is now disabled by default - no more interruptions
        // Users can always start writing immediately
        return;
    }

    // Delete entry functionality
    deleteEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        const confirmDelete = confirm(`Delete this entry from ${new Date(entry.date).toLocaleDateString()}?\n\n"${this.truncateText(entry.content, 100)}"`);

        if (confirmDelete) {
            this.entries = this.entries.filter(e => e.id !== entryId);

            // If we're currently editing this entry, clear the textarea
            if (this.currentEntryId === entryId) {
                this.newEntry();
            }

            this.saveEntries();
            this.renderEntries();
        }
    }

    // AI Service initialization and methods
    initializeAIService() {
        this.aiService.onStatusChange((status) => {
            this.updateAIStatus(status);
        });

        // Check AI status immediately and then periodically
        this.aiService.checkOllamaStatus();

        // Check every 30 seconds
        setInterval(() => {
            this.aiService.checkOllamaStatus();
        }, 30000);
    }

    updateAIStatus(status) {
        const statusElement = this.aiStatus.querySelector('span');
        const indicator = this.aiStatus.querySelector('.status-indicator');

        // Update status text and styling
        this.aiStatus.classList.remove('connected', 'generating', 'disconnected', 'checking', 'busy');

        switch (status) {
            case 'connected':
                statusElement.textContent = 'AI: Ready';
                this.aiStatus.classList.add('connected');
                this.aiCapabilities.style.display = 'block';
                break;
            case 'busy':
                statusElement.textContent = 'AI: Working...';
                this.aiStatus.classList.add('busy');
                this.aiCapabilities.style.display = 'block';
                break;
            case 'generating':
                statusElement.textContent = 'AI: Generating...';
                this.aiStatus.classList.add('generating');
                this.aiCapabilities.style.display = 'block';
                break;
            case 'checking':
                statusElement.textContent = 'AI: Checking...';
                this.aiStatus.classList.add('checking');
                this.aiCapabilities.style.display = 'none';
                break;
            case 'model-missing':
                statusElement.textContent = 'AI: Model Missing';
                this.aiStatus.classList.add('disconnected');
                this.aiCapabilities.style.display = 'none';
                break;
            case 'timeout':
                statusElement.textContent = 'AI: Connection Timeout';
                this.aiStatus.classList.add('disconnected');
                this.aiCapabilities.style.display = 'none';
                break;
            case 'not-installed':
                statusElement.textContent = 'AI: Ollama Not Found';
                this.aiStatus.classList.add('disconnected');
                this.aiCapabilities.style.display = 'none';
                break;
            default:
                statusElement.textContent = 'AI: Unavailable';
                this.aiStatus.classList.add('disconnected');
                this.aiCapabilities.style.display = 'none';
        }
    }

    // AI Chat functionality
    toggleAIChat() {
        const isVisible = this.floatingAIChat.style.display !== 'none';

        if (isVisible) {
            this.closeAIChat();
        } else {
            this.openAIChat();
        }
    }

    openAIChat() {
        this.floatingAIChat.style.display = 'flex';
        // Use setTimeout to ensure display change is processed before adding show class
        setTimeout(() => {
            this.floatingAIChat.classList.add('show');
        }, 10);

        // Clear any existing messages since chat content isn't saved
        this.chatMessages.innerHTML = `
            <div class="chat-welcome">
                <p>I can help you explore your journal entries and identify patterns in your thinking.</p>
                <p>Ask me about specific entries, themes across your writing, or insights from your reflections.</p>
            </div>
        `;

        setTimeout(() => {
            this.chatInput.focus();
        }, 300); // Wait for animation to complete
    }

    closeAIChat() {
        this.floatingAIChat.classList.remove('show');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            this.floatingAIChat.style.display = 'none';
        }, 300);
        
        // Clear messages when closing since they're not saved
        this.chatMessages.innerHTML = `
            <div class="chat-welcome">
                <p>I can help you explore your journal entries and identify patterns in your thinking.</p>
                <p>Ask me about specific entries, themes across your writing, or insights from your reflections.</p>
            </div>
        `;
    }

    async sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Clear welcome message if it exists
        const welcomeMsg = this.chatMessages.querySelector('.chat-welcome');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        // Add user message
        this.addChatMessage('user', message);
        this.chatInput.value = '';

        // Disable send button while processing
        this.chatSendBtn.disabled = true;
        this.chatSendBtn.textContent = 'Thinking...';

        // Show typing indicator
        const typingId = this.addChatMessage('ai', 'Thinking...', true);

        try {
            // Pass current entry context to AI
            const response = await this.aiService.chatWithEntries(message, this.entries, this.currentEntryId);

            // Remove typing indicator and add response
            document.getElementById(typingId).remove();
            this.addChatMessage('ai', response);
        } catch (error) {
            document.getElementById(typingId).remove();
            const currentModel = this.aiService.getCurrentModel();
            this.addChatMessage('ai', `I'm having trouble connecting right now and can't respond to your question. 

To get me working again:
• Make sure Ollama is running on your computer
• Download the ${currentModel.name} model: ollama pull ${currentModel.id}

I'll be here when you get me connected!`);
        } finally {
            // Re-enable send button
            this.chatSendBtn.disabled = false;
            this.chatSendBtn.textContent = 'Send';
        }
    }

    addChatMessage(sender, content, isTyping = false) {
        const messageDiv = document.createElement('div');
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        messageDiv.id = messageId;
        messageDiv.className = `chat-message ${sender}-message ${isTyping ? 'typing' : ''}`;

        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        return messageId;
    }



    // Test panel integration
    async toggleTestPanel() {
        const panel = document.getElementById('testPanel');
        const isVisible = panel.style.display !== 'none';

        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            // Show loading state
            panel.innerHTML = '<div class="test-loading">🧪 Running tests...</div>';

            // Run tests when panel is opened
            if (window.testFramework) {
                await window.testFramework.runAllTests();
            }
        }
    }



    // Entry title generation removed - focusing on chat-based AI interaction

    removeEntryTitle(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        // Remove the title
        entry.title = null;
        this.saveEntries();
        this.renderEntries();
    }


    initializeModelSelector() {
        this.currentModelDisplay = document.getElementById('currentModel');
        this.modelDropdown = document.getElementById('modelDropdown');
        this.modelDropdownBtn = document.getElementById('modelDropdownBtn');

        if (!this.currentModelDisplay || !this.modelDropdown || !this.modelDropdownBtn) return;

        // Update current model display
        this.updateCurrentModelDisplay();

        // Create model options
        this.createModelOptions();

        // Setup event listeners
        this.setupModelSelectorEvents();
    }

    updateCurrentModelDisplay() {
        const currentModel = this.aiService.getCurrentModel();
        const modelInfo = this.currentModelDisplay.querySelector('.model-info');

        if (modelInfo) {
            const nameEl = modelInfo.querySelector('.model-name');
            const descEl = modelInfo.querySelector('.model-description');

            if (nameEl) nameEl.textContent = currentModel.name || 'Unknown Model';
            if (descEl) descEl.textContent = `${currentModel.size} • ${currentModel.speed}`;
        }
    }

    createModelOptions() {
        const models = this.aiService.getAvailableModels();
        const currentModelId = this.aiService.getCurrentModel().id;

        this.modelDropdown.innerHTML = '';

        // Group models by category
        const categories = {
            'Latest': [],
            'Thinking': [],
            'Reliable': []
        };

        Object.entries(models).forEach(([id, model]) => {
            const category = model.category || 'Reliable';
            categories[category].push({ id, ...model });
        });

        // Create options for each category
        Object.entries(categories).forEach(([category, categoryModels]) => {
            if (categoryModels.length === 0) return;

            // Add category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'model-category-header';
            categoryHeader.innerHTML = `
                <div style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); font-weight: 600; color: var(--theme-text-muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--theme-border-light);">
                    ${category} Models
                </div>
            `;
            this.modelDropdown.appendChild(categoryHeader);

            // Add models in this category
            categoryModels.forEach(model => {
                const option = document.createElement('div');
                option.className = `model-option ${model.id === currentModelId ? 'active' : ''}`;
                option.dataset.modelId = model.id;

                const speedColor = {
                    'Ultra Fast': '#10b981',
                    'Very Fast': '#059669',
                    'Fast': '#f59e0b',
                    'Medium': '#f97316',
                    'Slow': '#ef4444'
                }[model.speed] || '#6b7280';

                option.innerHTML = `
                    <div class="model-option-header">
                        <div class="model-option-name">${model.name}</div>
                        <div class="model-option-size" style="background: ${speedColor}; color: white;">${model.size}</div>
                    </div>
                    <div class="model-option-description">${model.description}</div>
                `;

                this.modelDropdown.appendChild(option);
            });
        });
    }

    setupModelSelectorEvents() {
        // Toggle dropdown
        this.currentModelDisplay.addEventListener('click', () => {
            const isVisible = this.modelDropdown.style.display !== 'none';
            this.modelDropdown.style.display = isVisible ? 'none' : 'block';
            this.modelDropdownBtn.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Model selection
        this.modelDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.model-option');
            if (!option) return;

            const modelId = option.dataset.modelId;
            if (modelId) {
                // Update active state
                this.modelDropdown.querySelectorAll('.model-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');

                // Set new model (async)
                const model = this.aiService.getAvailableModels()[modelId];
                this.aiService.setModel(modelId);
                this.updateCurrentModelDisplay();

                // Hide dropdown
                this.modelDropdown.style.display = 'none';
                this.modelDropdownBtn.style.transform = 'rotate(0deg)';

                // Show toast notification
                this.themeManager.showToast(`Switching to ${model.name}...`, 'info', '🤖');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.model-selector')) {
                this.modelDropdown.style.display = 'none';
                this.modelDropdownBtn.style.transform = 'rotate(0deg)';
            }
        });
    }
}


// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.journal = new SimpleJournal();
    
    // Add debugging function to window for manual testing
    window.testSidebar = function() {
        console.log('=== SIDEBAR DEBUG TEST ===');
        console.log('Journal app:', window.journal);
        console.log('SidebarManager:', window.journal?.sidebarManager);
        console.log('Left toggle:', document.getElementById('leftToggle'));
        console.log('Right toggle:', document.getElementById('rightToggle'));
        console.log('Body classes:', document.body.className);
        
        // Try to manually toggle
        if (window.journal?.sidebarManager) {
            console.log('Attempting to open left sidebar...');
            window.journal.sidebarManager.openSidebar('left');
        } else {
            console.log('SidebarManager not available!');
        }
    };
});