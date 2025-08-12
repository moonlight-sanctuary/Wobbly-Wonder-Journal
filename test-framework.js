// Centralized Testing Framework for Journal App
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
    }

    // Add a test case
    addTest(name, testFunction, category = 'general') {
        this.tests.push({
            name,
            testFunction,
            category,
            id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
    }

    // Run all tests
    async runAllTests() {
        if (this.isRunning) {
            console.warn('Tests are already running');
            return;
        }

        this.isRunning = true;
        this.results = [];
        
        console.log('🧪 Starting automated test suite...');
        
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }
        
        this.displayResults();
        this.isRunning = false;
        
        return this.getTestSummary();
    }

    // Run a single test
    async runSingleTest(test) {
        try {
            const startTime = performance.now();
            const result = await test.testFunction();
            const endTime = performance.now();
            
            this.results.push({
                ...test,
                passed: result.passed,
                message: result.message,
                duration: endTime - startTime,
                error: null
            });
            
            console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
        } catch (error) {
            this.results.push({
                ...test,
                passed: false,
                message: 'Test threw an error',
                duration: 0,
                error: error.message
            });
            
            console.error(`❌ ${test.name}: Error - ${error.message}`);
        }
    }

    // Display test results
    displayResults() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const failed = total - passed;
        
        console.log('\n📊 Test Results Summary:');
        console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => !r.passed).forEach(result => {
                console.log(`  - ${result.name}: ${result.message}`);
                if (result.error) {
                    console.log(`    Error: ${result.error}`);
                }
            });
        }
        
        // Show results in UI if test panel exists
        this.updateTestUI();
    }

    // Update test UI panel
    updateTestUI() {
        const testPanel = document.getElementById('testPanel');
        if (!testPanel) return;

        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        testPanel.innerHTML = `
            <div class="test-summary">
                <h4>Test Results</h4>
                <div class="test-stats">
                    <span class="stat passed">${passed} Passed</span>
                    <span class="stat failed">${total - passed} Failed</span>
                    <span class="stat total">${total} Total</span>
                </div>
            </div>
            <div class="test-details">
                ${this.results.map(result => `
                    <div class="test-result ${result.passed ? 'pass' : 'fail'}">
                        <span class="test-name">${result.name}</span>
                        <span class="test-message">${result.message}</span>
                        <span class="test-duration">${result.duration.toFixed(2)}ms</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Get test summary
    getTestSummary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        return {
            total,
            passed,
            failed: total - passed,
            passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0,
            results: this.results
        };
    }

    // Helper method to wait for element
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Helper method to simulate user interaction
    simulateClick(element) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Helper method to simulate keyboard input
    simulateKeyboard(element, key, modifiers = {}) {
        const event = new KeyboardEvent('keydown', {
            key,
            ctrlKey: modifiers.ctrl || false,
            metaKey: modifiers.meta || false,
            shiftKey: modifiers.shift || false,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Helper method to wait for condition
    waitForCondition(condition, timeout = 5000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (condition()) {
                    resolve(true);
                    return;
                }
                
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Condition not met within timeout'));
                    return;
                }
                
                setTimeout(check, interval);
            };
            
            check();
        });
    }
}

// Initialize global test framework
window.testFramework = new TestFramework();

// Define core app tests
function setupCoreTests() {
    const tf = window.testFramework;

    // App Initialization Tests
    tf.addTest('App Loads Successfully', async () => {
        const app = window.journal;
        return {
            passed: app !== undefined && app.entries !== undefined,
            message: app ? 'App initialized correctly' : 'App failed to initialize'
        };
    }, 'initialization');

    tf.addTest('DOM Elements Present', async () => {
        const requiredElements = [
            '#journalEntry',
            '#wordCount',
            '#leftToggle',
            '#rightToggle',
            '#entryList',
            '#searchInput'
        ];
        
        const missingElements = requiredElements.filter(selector => !document.querySelector(selector));
        
        return {
            passed: missingElements.length === 0,
            message: missingElements.length === 0 ? 'All required elements present' : `Missing elements: ${missingElements.join(', ')}`
        };
    }, 'initialization');

    // Sidebar Tests
    tf.addTest('Sidebar Manager Initialized', async () => {
        const app = window.journal;
        return {
            passed: app.sidebarManager !== null && app.sidebarManager !== undefined,
            message: app.sidebarManager ? 'SidebarManager initialized' : 'SidebarManager not initialized'
        };
    }, 'sidebar');

    tf.addTest('Left Sidebar Toggle', async () => {
        const app = window.journal;
        const leftToggle = document.getElementById('leftToggle');
        
        // Ensure no sidebar is open initially
        app.sidebarManager.closeSidebar('left');
        app.sidebarManager.closeSidebar('right');
        
        // Click left toggle
        tf.simulateClick(leftToggle);
        
        return {
            passed: app.sidebarManager.isSidebarOpen('left'),
            message: app.sidebarManager.isSidebarOpen('left') ? 'Left sidebar opened' : 'Left sidebar failed to open'
        };
    }, 'sidebar');

    tf.addTest('Right Sidebar Toggle', async () => {
        const app = window.journal;
        const rightToggle = document.getElementById('rightToggle');
        
        // Ensure no sidebar is open initially
        app.sidebarManager.closeSidebar('left');
        app.sidebarManager.closeSidebar('right');
        
        // Click right toggle
        tf.simulateClick(rightToggle);
        
        return {
            passed: app.sidebarManager.isSidebarOpen('right'),
            message: app.sidebarManager.isSidebarOpen('right') ? 'Right sidebar opened' : 'Right sidebar failed to open'
        };
    }, 'sidebar');

    tf.addTest('Sidebar Mutual Exclusivity', async () => {
        const app = window.journal;
        const leftToggle = document.getElementById('leftToggle');
        const rightToggle = document.getElementById('rightToggle');
        
        // Open left sidebar
        tf.simulateClick(leftToggle);
        const leftOpen = app.sidebarManager.isSidebarOpen('left');
        
        // Open right sidebar (should close left)
        tf.simulateClick(rightToggle);
        const rightOpen = app.sidebarManager.isSidebarOpen('right');
        const leftClosed = !app.sidebarManager.isSidebarOpen('left');
        
        return {
            passed: leftOpen && rightOpen && leftClosed,
            message: (leftOpen && rightOpen && leftClosed) ? 'Mutual exclusivity working' : 'Mutual exclusivity failed'
        };
    }, 'sidebar');

    // Writing Tests
    tf.addTest('Textarea Input', async () => {
        const textarea = document.getElementById('journalEntry');
        const testText = 'Test entry content';
        
        textarea.value = testText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        return {
            passed: textarea.value === testText,
            message: textarea.value === testText ? 'Textarea input working' : 'Textarea input failed'
        };
    }, 'writing');

    tf.addTest('Word Count Update', async () => {
        const textarea = document.getElementById('journalEntry');
        const wordCount = document.getElementById('wordCount');
        const testText = 'one two three four five';
        
        textarea.value = testText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait for word count to update
        await tf.waitForCondition(() => wordCount.textContent.includes('5'), 1000);
        
        return {
            passed: wordCount.textContent.includes('5'),
            message: wordCount.textContent.includes('5') ? 'Word count updated correctly' : `Word count incorrect: ${wordCount.textContent}`
        };
    }, 'writing');

    // Search Tests
    tf.addTest('Search Input Present', async () => {
        const searchInput = document.getElementById('searchInput');
        return {
            passed: searchInput !== null,
            message: searchInput ? 'Search input present' : 'Search input missing'
        };
    }, 'search');

    // Keyboard Shortcut Tests
    tf.addTest('Keyboard Shortcut Left Sidebar', async () => {
        const app = window.journal;
        
        // Ensure no sidebar is open
        app.sidebarManager.closeSidebar('left');
        app.sidebarManager.closeSidebar('right');
        
        // Simulate Cmd+[
        tf.simulateKeyboard(document, '[', { meta: true });
        
        return {
            passed: app.sidebarManager.isSidebarOpen('left'),
            message: app.sidebarManager.isSidebarOpen('left') ? 'Left sidebar keyboard shortcut working' : 'Left sidebar keyboard shortcut failed'
        };
    }, 'keyboard');

    tf.addTest('Keyboard Shortcut Right Sidebar', async () => {
        const app = window.journal;
        
        // Ensure no sidebar is open
        app.sidebarManager.closeSidebar('left');
        app.sidebarManager.closeSidebar('right');
        
        // Simulate Cmd+]
        tf.simulateKeyboard(document, ']', { meta: true });
        
        return {
            passed: app.sidebarManager.isSidebarOpen('right'),
            message: app.sidebarManager.isSidebarOpen('right') ? 'Right sidebar keyboard shortcut working' : 'Right sidebar keyboard shortcut failed'
        };
    }, 'keyboard');

    // Welcome Screen Tests
    // Welcome screen tests removed - feature no longer exists

    // Welcome screen reappear test removed - feature no longer exists

    tf.addTest('Sidebar Toggle Functionality', async () => {
        const app = window.journal;
        const leftToggle = document.getElementById('leftToggle');
        
        // Test left sidebar toggle
        tf.simulateClick(leftToggle);
        const sidebarOpened = app.sidebarManager.isSidebarOpen('left');
        
        // Close sidebar
        tf.simulateClick(leftToggle);
        const sidebarClosed = !app.sidebarManager.isSidebarOpen('left');
        
        return {
            passed: sidebarOpened && sidebarClosed,
            message: `Sidebar toggle - Open: ${sidebarOpened ? 'PASS' : 'FAIL'}, Close: ${sidebarClosed ? 'PASS' : 'FAIL'}`
        };
    }, 'sidebar');

    // Floating New Entry Button Tests
    tf.addTest('Floating New Entry Button Present', async () => {
        const floatingBtn = document.getElementById('floatingNewBtn');
        return {
            passed: floatingBtn !== null,
            message: floatingBtn ? 'Floating new entry button present' : 'Floating new entry button missing'
        };
    }, 'floating-button');

    tf.addTest('Floating Button Creates New Entry', async () => {
        const app = window.journal;
        const floatingBtn = document.getElementById('floatingNewBtn');
        const textarea = document.getElementById('journalEntry');
        
        // Add some content first
        textarea.value = 'existing content';
        
        // Click floating button
        tf.simulateClick(floatingBtn);
        
        const isCleared = textarea.value === '';
        const isFocused = document.activeElement === textarea;
        
        return {
            passed: isCleared && isFocused,
            message: (isCleared && isFocused) ? 'Floating button creates new entry correctly' : 'Floating button failed to create new entry'
        };
    }, 'floating-button');

    tf.addTest('Floating Button Visible Across Interface States', async () => {
        const app = window.journal;
        const floatingBtn = document.getElementById('floatingNewBtn');
        
        // Test with no sidebars open
        app.sidebarManager.closeSidebar('left');
        app.sidebarManager.closeSidebar('right');
        const visibleNoSidebars = window.getComputedStyle(floatingBtn).display !== 'none';
        
        // Test with left sidebar open
        app.sidebarManager.openSidebar('left');
        const visibleLeftOpen = window.getComputedStyle(floatingBtn).display !== 'none';
        
        // Test with right sidebar open
        app.sidebarManager.openSidebar('right');
        const visibleRightOpen = window.getComputedStyle(floatingBtn).display !== 'none';
        
        const allVisible = visibleNoSidebars && visibleLeftOpen && visibleRightOpen;
        
        return {
            passed: allVisible,
            message: allVisible ? 'Floating button visible across all interface states' : 'Floating button visibility issues detected'
        };
    }, 'floating-button');

    // AI Service Tests
    tf.addTest('AI Service Initialized', async () => {
        const app = window.journal;
        return {
            passed: app.aiService !== null && app.aiService !== undefined,
            message: app.aiService ? 'AI service initialized' : 'AI service not initialized'
        };
    }, 'ai');

    tf.addTest('AI Chat Interface Present', async () => {
        const chatInterface = document.getElementById('aiChatInterface');
        const chatBtn = document.getElementById('aiChatBtn');
        return {
            passed: chatInterface !== null && chatBtn !== null,
            message: (chatInterface && chatBtn) ? 'AI chat interface elements present' : 'AI chat interface elements missing'
        };
    }, 'ai');

    tf.addTest('AI Status Updates', async () => {
        const app = window.journal;
        const statusElement = document.getElementById('aiStatus');
        
        // Test status update
        app.updateAIStatus('checking');
        const hasCheckingClass = statusElement.classList.contains('checking');
        
        return {
            passed: hasCheckingClass,
            message: hasCheckingClass ? 'AI status updates correctly' : 'AI status update failed'
        };
    }, 'ai');

    // Entry Management Tests
    tf.addTest('Entry Delete Buttons Present', async () => {
        const app = window.journal;
        
        // Add a test entry first
        const testEntry = {
            id: 'test-entry-123',
            content: 'Test entry for deletion',
            date: new Date().toISOString(),
            wordCount: 4
        };
        app.entries.unshift(testEntry);
        app.renderEntries();
        
        const deleteBtn = document.querySelector('.entry-delete-btn');
        
        return {
            passed: deleteBtn !== null,
            message: deleteBtn ? 'Entry delete buttons present' : 'Entry delete buttons missing'
        };
    }, 'entry-management');

    tf.addTest('Test Panel Integration', async () => {
        const testToggleBtn = document.getElementById('testToggleBtn');
        const testPanel = document.getElementById('testPanel');
        
        return {
            passed: testToggleBtn !== null && testPanel !== null,
            message: (testToggleBtn && testPanel) ? 'Test panel integrated in sidebar' : 'Test panel integration failed'
        };
    }, 'testing');

    // Enhanced AI Functionality Tests
    tf.addTest('AI Smart Context Creation', async () => {
        const app = window.journal;
        
        // Create test entries
        const testEntries = [
            { id: '1', content: 'Today I worked on a project about machine learning', date: new Date().toISOString(), wordCount: 10 },
            { id: '2', content: 'Had a great day at the beach with friends', date: new Date(Date.now() - 86400000).toISOString(), wordCount: 9 },
            { id: '3', content: 'Working on machine learning algorithms again', date: new Date(Date.now() - 172800000).toISOString(), wordCount: 8 }
        ];
        
        const context = app.aiService.createSmartContext('machine learning', testEntries);
        const hasRelevantSection = context.includes('MOST RELEVANT ENTRIES');
        const hasAllEntries = context.includes('COMPLETE JOURNAL HISTORY');
        
        return {
            passed: hasRelevantSection && hasAllEntries,
            message: (hasRelevantSection && hasAllEntries) ? 'Smart context creation working' : 'Smart context creation failed'
        };
    }, 'ai-enhanced');

    tf.addTest('AI Entry Relevance Detection', async () => {
        const app = window.journal;
        
        const relevant = app.aiService.isEntryRelevant('machine learning', 'today i worked on machine learning algorithms');
        const notRelevant = app.aiService.isEntryRelevant('machine learning', 'went to the store and bought groceries');
        
        return {
            passed: relevant && !notRelevant,
            message: (relevant && !notRelevant) ? 'Entry relevance detection working' : 'Entry relevance detection failed'
        };
    }, 'ai-enhanced');

    tf.addTest('AI Theme Extraction', async () => {
        const app = window.journal;
        
        const testEntries = [
            { content: 'work project deadline stress pressure' },
            { content: 'work meeting project planning' },
            { content: 'project completion work satisfaction' }
        ];
        
        const themes = app.aiService.extractThemes(testEntries);
        const hasWorkTheme = themes.includes('work') || themes.includes('project');
        
        return {
            passed: themes.length > 0 && hasWorkTheme,
            message: hasWorkTheme ? 'Theme extraction working' : `Theme extraction failed: ${themes.join(', ')}`
        };
    }, 'ai-enhanced');

    // Entry Summary Tests
    tf.addTest('Entry Summary Elements Present', async () => {
        const entrySummary = document.getElementById('entrySummary');
        const summaryContent = document.getElementById('summaryContent');
        const aiEntrySummaryBtn = document.getElementById('aiEntrySummaryBtn');
        
        return {
            passed: entrySummary !== null && summaryContent !== null && aiEntrySummaryBtn !== null,
            message: (entrySummary && summaryContent && aiEntrySummaryBtn) ? 'Entry summary elements present' : 'Entry summary elements missing'
        };
    }, 'entry-summary');

    tf.addTest('Entry Title Generation Button Present', async () => {
        const app = window.journal;
        
        // Add a test entry first
        const testEntry = {
            id: 'test-entry-title-123',
            content: 'Test entry for title generation',
            date: new Date().toISOString(),
            wordCount: 5
        };
        app.entries.unshift(testEntry);
        app.renderEntries();
        
        const titleBtn = document.querySelector('.entry-summarize-btn');
        
        return {
            passed: titleBtn !== null,
            message: titleBtn ? 'Entry title generation buttons present' : 'Entry title generation buttons missing'
        };
    }, 'entry-summary');

    tf.addTest('Entry Summary Show/Hide Functionality', async () => {
        const app = window.journal;
        const entrySummary = document.getElementById('entrySummary');
        
        // Test show
        app.showEntrySummary('Test summary content');
        const isVisible = entrySummary.style.display !== 'none';
        
        // Test hide
        app.hideEntrySummary();
        const isHidden = entrySummary.style.display === 'none';
        
        return {
            passed: isVisible && isHidden,
            message: (isVisible && isHidden) ? 'Entry summary show/hide working' : 'Entry summary show/hide failed'
        };
    }, 'entry-summary');

    // Comprehensive AI Chat Tests
    tf.addTest('AI Chat Toggle Functionality', async () => {
        const app = window.journal;
        const chatInterface = document.getElementById('aiChatInterface');
        
        // Test open
        app.openAIChat();
        const isOpen = chatInterface.style.display !== 'none';
        
        // Test close
        app.closeAIChat();
        const isClosed = chatInterface.style.display === 'none';
        
        return {
            passed: isOpen && isClosed,
            message: (isOpen && isClosed) ? 'AI chat toggle working' : 'AI chat toggle failed'
        };
    }, 'ai-chat');

    tf.addTest('AI Chat Message Addition', async () => {
        const app = window.journal;
        const chatMessages = document.getElementById('chatMessages');
        
        // Clear any existing messages
        chatMessages.innerHTML = '';
        
        // Add test message
        const messageId = app.addChatMessage('user', 'Test message');
        const messageElement = document.getElementById(messageId);
        
        return {
            passed: messageElement !== null && messageElement.textContent.includes('Test message'),
            message: messageElement ? 'Chat message addition working' : 'Chat message addition failed'
        };
    }, 'ai-chat');

    tf.addTest('AI Status Monitoring', async () => {
        const app = window.journal;
        const statusElement = document.getElementById('aiStatus');
        
        // Test different status updates
        app.updateAIStatus('connected');
        const hasConnected = statusElement.classList.contains('connected');
        
        app.updateAIStatus('checking');
        const hasChecking = statusElement.classList.contains('checking');
        
        app.updateAIStatus('disconnected');
        const hasDisconnected = statusElement.classList.contains('disconnected');
        
        return {
            passed: hasConnected && hasChecking && hasDisconnected,
            message: (hasConnected && hasChecking && hasDisconnected) ? 'AI status monitoring working' : 'AI status monitoring failed'
        };
    }, 'ai-status');

    tf.addTest('AI Capabilities Display', async () => {
        const app = window.journal;
        const capabilities = document.getElementById('aiCapabilities');
        
        // Test show capabilities
        app.updateAIStatus('connected');
        const isVisible = capabilities.style.display !== 'none';
        
        // Test hide capabilities
        app.updateAIStatus('disconnected');
        const isHidden = capabilities.style.display === 'none';
        
        return {
            passed: isVisible && isHidden,
            message: (isVisible && isHidden) ? 'AI capabilities display working' : 'AI capabilities display failed'
        };
    }, 'ai-capabilities');

    // Welcome Screen Responsiveness Tests
    // Welcome screen tests removed - feature no longer exists

    // Entry Management Comprehensive Tests
    tf.addTest('Entry Data Structure Enhancement', async () => {
        const app = window.journal;
        
        // Create test entry
        app.textarea.value = 'Test entry content for data structure';
        app.saveCurrentEntry();
        
        const latestEntry = app.entries[0];
        const hasRequiredFields = latestEntry.hasOwnProperty('summary') && 
                                 latestEntry.hasOwnProperty('title') &&
                                 latestEntry.hasOwnProperty('id') &&
                                 latestEntry.hasOwnProperty('content') &&
                                 latestEntry.hasOwnProperty('date') &&
                                 latestEntry.hasOwnProperty('wordCount');
        
        return {
            passed: hasRequiredFields,
            message: hasRequiredFields ? 'Entry data structure enhanced correctly' : 'Entry data structure missing fields'
        };
    }, 'entry-management');

    tf.addTest('Entry Actions Hover Behavior', async () => {
        const app = window.journal;
        
        // Ensure we have an entry
        if (app.entries.length === 0) {
            const testEntry = {
                id: 'test-hover-123',
                content: 'Test entry for hover behavior',
                date: new Date().toISOString(),
                wordCount: 5,
                summary: null,
                title: null
            };
            app.entries.unshift(testEntry);
            app.renderEntries();
        }
        
        const entryItem = document.querySelector('.entry-item');
        const summarizeBtn = entryItem?.querySelector('.entry-summarize-btn');
        const deleteBtn = entryItem?.querySelector('.entry-delete-btn');
        
        return {
            passed: entryItem && summarizeBtn && deleteBtn,
            message: (entryItem && summarizeBtn && deleteBtn) ? 'Entry action buttons present' : 'Entry action buttons missing'
        };
    }, 'entry-management');

    // Floating Button Tests
    tf.addTest('Floating Button Responsive Design', async () => {
        const floatingBtn = document.getElementById('floatingNewBtn');
        const btnText = floatingBtn?.querySelector('.floating-btn-text');
        
        // Check if button has proper styling classes
        const hasProperStyling = floatingBtn && 
                                window.getComputedStyle(floatingBtn).position === 'fixed' &&
                                window.getComputedStyle(floatingBtn).bottom !== 'auto';
        
        return {
            passed: hasProperStyling && btnText,
            message: (hasProperStyling && btnText) ? 'Floating button responsive design working' : 'Floating button responsive design failed'
        };
    }, 'floating-button');

    // Comprehensive Integration Tests
    tf.addTest('Complete App Integration', async () => {
        const app = window.journal;
        
        // Test that all major components are initialized
        const hasCore = app.entries !== undefined && app.sidebarManager !== null;
        const hasAI = app.aiService !== null;
        const hasElements = document.getElementById('journalEntry') && 
                           document.getElementById('leftToggle') && 
                           document.getElementById('rightToggle');
        
        return {
            passed: hasCore && hasAI && hasElements,
            message: (hasCore && hasAI && hasElements) ? 'Complete app integration working' : 'App integration issues detected'
        };
    }, 'integration');

    tf.addTest('AI Service Methods Available', async () => {
        const app = window.journal;
        const aiService = app.aiService;
        
        const hasRequiredMethods = typeof aiService.checkOllamaStatus === 'function' &&
                                  typeof aiService.generateSummary === 'function' &&
                                  typeof aiService.generateEntryTitle === 'function' &&
                                  typeof aiService.chatWithEntries === 'function' &&
                                  typeof aiService.summarizeAllEntries === 'function';
        
        return {
            passed: hasRequiredMethods,
            message: hasRequiredMethods ? 'All AI service methods available' : 'AI service methods missing'
        };
    }, 'ai-service');

    tf.addTest('Smart Context Creation Available', async () => {
        const app = window.journal;
        const aiService = app.aiService;
        
        const hasSmartMethods = typeof aiService.createSmartContext === 'function' &&
                               typeof aiService.isEntryRelevant === 'function' &&
                               typeof aiService.extractThemes === 'function' &&
                               typeof aiService.groupEntriesByMonth === 'function';
        
        return {
            passed: hasSmartMethods,
            message: hasSmartMethods ? 'Smart context creation methods available' : 'Smart context methods missing'
        };
    }, 'ai-enhanced');

    tf.addTest('Entry Summary UI Integration', async () => {
        const app = window.journal;
        
        // Test summary display
        app.showEntrySummary('Test summary content');
        const summaryVisible = document.getElementById('entrySummary').style.display !== 'none';
        
        // Test summary content
        const summaryContent = document.getElementById('summaryContent').textContent;
        const hasContent = summaryContent.includes('Test summary content');
        
        // Test close functionality
        app.hideEntrySummary();
        const summaryHidden = document.getElementById('entrySummary').style.display === 'none';
        
        return {
            passed: summaryVisible && hasContent && summaryHidden,
            message: (summaryVisible && hasContent && summaryHidden) ? 'Entry summary UI integration working' : 'Entry summary UI integration failed'
        };
    }, 'entry-summary');

    // Entry-Specific Summary Persistence Tests
    tf.addTest('Summary Entry Association', async () => {
        const app = window.journal;
        
        // Create test entry with summary
        const testEntry = {
            id: 'test-summary-association-123',
            content: 'Test entry with summary',
            date: new Date().toISOString(),
            wordCount: 4,
            summary: 'Test summary content',
            title: null
        };
        app.entries.unshift(testEntry);
        
        // Load the entry
        app.loadEntry(testEntry.id);
        
        // Check if summary is displayed
        const summaryVisible = document.getElementById('entrySummary').style.display !== 'none';
        const summaryContent = document.getElementById('summaryContent').textContent;
        const hasCorrectContent = summaryContent.includes('Test summary content');
        
        return {
            passed: summaryVisible && hasCorrectContent,
            message: (summaryVisible && hasCorrectContent) ? 'Summary entry association working' : 'Summary entry association failed'
        };
    }, 'entry-summary-persistence');

    tf.addTest('Summary Hides When Switching Entries', async () => {
        const app = window.journal;
        
        // Create two test entries - one with summary, one without
        const entryWithSummary = {
            id: 'test-with-summary-123',
            content: 'Entry with summary',
            date: new Date().toISOString(),
            wordCount: 3,
            summary: 'This entry has a summary',
            title: null
        };
        
        const entryWithoutSummary = {
            id: 'test-without-summary-123',
            content: 'Entry without summary',
            date: new Date(Date.now() - 1000).toISOString(),
            wordCount: 3,
            summary: null,
            title: null
        };
        
        app.entries.unshift(entryWithSummary, entryWithoutSummary);
        
        // Load entry with summary
        app.loadEntry(entryWithSummary.id);
        const summaryVisibleFirst = document.getElementById('entrySummary').style.display !== 'none';
        
        // Switch to entry without summary
        app.loadEntry(entryWithoutSummary.id);
        const summaryHiddenSecond = document.getElementById('entrySummary').style.display === 'none';
        
        return {
            passed: summaryVisibleFirst && summaryHiddenSecond,
            message: (summaryVisibleFirst && summaryHiddenSecond) ? 'Summary properly hides when switching entries' : 'Summary switching behavior failed'
        };
    }, 'entry-summary-persistence');

    tf.addTest('Summary Action Buttons Present', async () => {
        const regenerateBtn = document.getElementById('summaryRegenerateBtn');
        const deleteBtn = document.getElementById('summaryDeleteBtn');
        const closeBtn = document.getElementById('summaryCloseBtn');
        
        return {
            passed: regenerateBtn && deleteBtn && closeBtn,
            message: (regenerateBtn && deleteBtn && closeBtn) ? 'Summary action buttons present' : 'Summary action buttons missing'
        };
    }, 'entry-summary-persistence');

    tf.addTest('New Entry Hides Summary', async () => {
        const app = window.journal;
        
        // Show a summary first
        app.showEntrySummary('Test summary', 'test-id');
        const summaryVisible = document.getElementById('entrySummary').style.display !== 'none';
        
        // Create new entry
        app.newEntry();
        const summaryHidden = document.getElementById('entrySummary').style.display === 'none';
        
        return {
            passed: summaryVisible && summaryHidden,
            message: (summaryVisible && summaryHidden) ? 'New entry properly hides summary' : 'New entry summary hiding failed'
        };
    }, 'entry-summary-persistence');

    tf.addTest('Mobile Responsiveness Check', async () => {
        const welcomeContent = document.querySelector('.welcome-content');
        const floatingBtn = document.getElementById('floatingNewBtn');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        // Check if elements have responsive CSS classes/properties
        const welcomeResponsive = welcomeContent && window.getComputedStyle(welcomeContent).maxWidth !== 'none';
        const btnResponsive = floatingBtn && window.getComputedStyle(floatingBtn).position === 'fixed';
        const toggleResponsive = sidebarToggle && window.getComputedStyle(sidebarToggle).position === 'fixed';
        
        return {
            passed: welcomeResponsive && btnResponsive && toggleResponsive,
            message: (welcomeResponsive && btnResponsive && toggleResponsive) ? 'Mobile responsiveness implemented' : 'Mobile responsiveness issues detected'
        };
    }, 'responsive');
}

// Auto-setup tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupCoreTests, 1000); // Wait for app to initialize
    });
} else {
    setTimeout(setupCoreTests, 1000);
}
// ==
=== COMPREHENSIVE FEATURE TESTS =====

// Theme System Tests
tf.addTest(() => {
    const app = window.journal;
    const themeManager = app.themeManager;
    
    // Test theme switching
    const originalTheme = themeManager.currentTheme;
    themeManager.setTheme('cool');
    const themeChanged = themeManager.currentTheme === 'cool';
    
    // Test mode switching
    const originalMode = themeManager.currentMode;
    themeManager.toggleMode();
    const modeChanged = themeManager.currentMode !== originalMode;
    
    // Restore original settings
    themeManager.setTheme(originalTheme);
    if (modeChanged) themeManager.toggleMode();
    
    return {
        passed: themeChanged && modeChanged,
        message: `Theme switching: ${themeChanged ? 'PASS' : 'FAIL'}, Mode switching: ${modeChanged ? 'PASS' : 'FAIL'}`
    };
}, 'theming');

tf.addTest(() => {
    const app = window.journal;
    const themeManager = app.themeManager;
    
    // Test theme persistence
    const testTheme = 'minimal';
    const testMode = 'dark';
    
    themeManager.setTheme(testTheme, testMode);
    
    // Check localStorage
    const saved = localStorage.getItem('themePreferences');
    const preferences = saved ? JSON.parse(saved) : null;
    
    const persistenceWorks = preferences && 
                           preferences.theme === testTheme && 
                           preferences.mode === testMode;
    
    return {
        passed: persistenceWorks,
        message: persistenceWorks ? 'Theme persistence working' : 'Theme persistence failed'
    };
}, 'theming');

// AI Model Selection Tests
tf.addTest(() => {
    const app = window.journal;
    const aiService = app.aiService;
    
    // Test model switching
    const originalModel = aiService.model;
    const availableModels = Object.keys(aiService.getAvailableModels());
    const testModel = availableModels.find(m => m !== originalModel);
    
    if (!testModel) {
        return {
            passed: true,
            message: 'Only one model available, skipping model switching test'
        };
    }
    
    aiService.setModel(testModel);
    const modelChanged = aiService.model === testModel;
    
    // Restore original model
    aiService.setModel(originalModel);
    
    return {
        passed: modelChanged,
        message: modelChanged ? 'AI model switching working' : 'AI model switching failed'
    };
}, 'ai');

tf.addTest(() => {
    const app = window.journal;
    const aiService = app.aiService;
    
    // Test model categories
    const models = aiService.getAvailableModels();
    const hasLatest = Object.values(models).some(m => m.category === 'Latest');
    const hasThinking = Object.values(models).some(m => m.category === 'Thinking');
    const hasReliable = Object.values(models).some(m => m.category === 'Reliable');
    
    return {
        passed: hasLatest && hasThinking && hasReliable,
        message: `Model categories - Latest: ${hasLatest}, Thinking: ${hasThinking}, Reliable: ${hasReliable}`
    };
}, 'ai');

// Autosave and Timestamp Tests
tf.addTest(() => {
    const app = window.journal;
    const textarea = document.getElementById('journalEntry');
    const autosaveStatus = document.getElementById('autosaveStatus');
    const lastSavedTime = document.getElementById('lastSavedTime');
    
    // Clear textarea and add test content
    textarea.value = '';
    app.currentEntryId = null;
    
    const testContent = 'Test autosave functionality';
    textarea.value = testContent;
    
    // Trigger autosave
    app.autoSave();
    
    // Wait for autosave to complete
    return new Promise((resolve) => {
        setTimeout(() => {
            const statusShowing = autosaveStatus && autosaveStatus.textContent.includes('Saved');
            const timeShowing = lastSavedTime && lastSavedTime.textContent.length > 0;
            
            resolve({
                passed: statusShowing && timeShowing,
                message: `Autosave status: ${statusShowing ? 'PASS' : 'FAIL'}, Time display: ${timeShowing ? 'PASS' : 'FAIL'}`
            });
        }, 1500);
    });
}, 'autosave');

tf.addTest(() => {
    const app = window.journal;
    
    // Test continuous time updates
    const mockTimestamp = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    app.lastSavedTimestamp = mockTimestamp;
    app.updateSavedTimeDisplay();
    
    const timeText = document.getElementById('lastSavedTime').textContent;
    const showsMinutesAgo = timeText.includes('min ago');
    
    return {
        passed: showsMinutesAgo,
        message: showsMinutesAgo ? 'Continuous time updates working' : 'Time updates not working'
    };
}, 'autosave');

// Date Grouping Tests
tf.addTest(() => {
    const app = window.journal;
    
    // Create test entries with different dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const testEntries = [
        { id: 'test1', content: 'Today entry', date: today.toISOString() },
        { id: 'test2', content: 'Yesterday entry', date: yesterday.toISOString() },
        { id: 'test3', content: 'Last week entry', date: lastWeek.toISOString() }
    ];
    
    const grouped = app.groupEntriesByDate(testEntries);
    const hasToday = grouped.hasOwnProperty('Today');
    const hasYesterday = grouped.hasOwnProperty('Yesterday');
    const hasOtherDate = Object.keys(grouped).some(key => key !== 'Today' && key !== 'Yesterday');
    
    return {
        passed: hasToday && hasYesterday && hasOtherDate,
        message: `Date grouping - Today: ${hasToday}, Yesterday: ${hasYesterday}, Other: ${hasOtherDate}`
    };
}, 'entries');

// Toast Notification Tests
tf.addTest(() => {
    const app = window.journal;
    const themeManager = app.themeManager;
    
    // Test toast creation
    themeManager.showToast('Test message', 'success', '✅');
    
    // Check if toast container exists and has toast
    const toastContainer = document.querySelector('.toast-container');
    const hasToast = toastContainer && toastContainer.children.length > 0;
    
    return {
        passed: hasToast,
        message: hasToast ? 'Toast notifications working' : 'Toast notifications failed'
    };
}, 'ui');

// Floating Button Responsive Tests
tf.addTest(() => {
    const app = window.journal;
    const floatingBtn = document.getElementById('floatingNewBtn');
    
    if (!floatingBtn) {
        return { passed: false, message: 'Floating button not found' };
    }
    
    // Test button positioning with sidebar open
    app.sidebarManager.openSidebar('right');
    const rightOpenStyle = window.getComputedStyle(floatingBtn);
    const movedWhenRightOpen = rightOpenStyle.right !== '24px'; // Should move left when right sidebar opens
    
    app.sidebarManager.closeSidebar('right');
    
    return {
        passed: movedWhenRightOpen,
        message: movedWhenRightOpen ? 'Floating button responsive positioning working' : 'Button positioning failed'
    };
}, 'ui');

// Entry Title Management Tests
tf.addTest(() => {
    const app = window.journal;
    
    // Create test entry with title
    const testEntry = {
        id: 'title-test',
        content: 'Test entry for title management',
        date: new Date().toISOString(),
        title: 'Test Title'
    };
    
    app.entries.unshift(testEntry);
    app.renderEntries();
    
    // Check if title remove button exists
    const titleRemoveBtn = document.querySelector('.entry-title-remove');
    const hasTitleRemoveBtn = titleRemoveBtn !== null;
    
    // Test title removal
    if (hasTitleRemoveBtn) {
        app.removeEntryTitle('title-test');
        const entryAfterRemoval = app.entries.find(e => e.id === 'title-test');
        const titleRemoved = !entryAfterRemoval || !entryAfterRemoval.title;
        
        // Clean up
        app.entries = app.entries.filter(e => e.id !== 'title-test');
        app.renderEntries();
        
        return {
            passed: titleRemoved,
            message: titleRemoved ? 'Entry title removal working' : 'Title removal failed'
        };
    }
    
    return {
        passed: false,
        message: 'Title remove button not found'
    };
}, 'entries');

// AI Status Indicator Tests
tf.addTest(() => {
    const app = window.journal;
    const aiStatus = document.getElementById('aiStatus');
    
    if (!aiStatus) {
        return { passed: false, message: 'AI status element not found' };
    }
    
    // Test different status states
    app.updateAIStatus('busy');
    const hasBusyClass = aiStatus.classList.contains('busy');
    
    app.updateAIStatus('connected');
    const hasConnectedClass = aiStatus.classList.contains('connected');
    
    return {
        passed: hasBusyClass && hasConnectedClass,
        message: `AI status indicators - Busy: ${hasBusyClass}, Connected: ${hasConnectedClass}`
    };
}, 'ai');

// Comprehensive Integration Test
tf.addTest(() => {
    const app = window.journal;
    
    // Test complete workflow
    const textarea = document.getElementById('journalEntry');
    const originalContent = textarea.value;
    
    // 1. Write content
    textarea.value = 'Integration test entry';
    app.autoSave();
    
    // 2. Switch theme
    const originalTheme = app.themeManager.currentTheme;
    app.themeManager.setTheme('cool');
    
    // 3. Open sidebar
    app.sidebarManager.openSidebar('left');
    const sidebarOpen = app.sidebarManager.isSidebarOpen('left');
    
    // 4. Close sidebar
    app.sidebarManager.closeSidebar('left');
    const sidebarClosed = !app.sidebarManager.isSidebarOpen('left');
    
    // 5. Create new entry
    app.newEntry();
    const textareaCleared = textarea.value === '';
    
    // Restore state
    textarea.value = originalContent;
    app.themeManager.setTheme(originalTheme);
    
    const allPassed = sidebarOpen && sidebarClosed && textareaCleared;
    
    return {
        passed: allPassed,
        message: `Integration test - Sidebar: ${sidebarOpen && sidebarClosed ? 'PASS' : 'FAIL'}, New entry: ${textareaCleared ? 'PASS' : 'FAIL'}`
    };
}, 'integration');

console.log('✅ Added comprehensive feature tests for:');
console.log('   • Theme system (switching, persistence)');
console.log('   • AI model selection and categories');
console.log('   • Autosave with continuous timestamps');
console.log('   • Date grouping functionality');
console.log('   • Toast notifications');
console.log('   • Responsive floating button');
console.log('   • Entry title management');
console.log('   • AI status indicators');
console.log('   • Complete integration workflow');