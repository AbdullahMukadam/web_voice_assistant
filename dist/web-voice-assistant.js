(function() {
    // Use the global window object if available, otherwise fallback to a local object
    var globalObj = (typeof window !== 'undefined') ? window : this;
    globalObj.WebVoiceAssistant = globalObj.WebVoiceAssistant || {};
    var WebVoiceAssistant = globalObj.WebVoiceAssistant;
    
    // Core modules - wrap each in IIFE to prevent collisions
    (function() {
            WebVoiceAssistant.extractPageContext = function() {
    const content = [];

    // Get title
    if (document.title) {
        content.push(`Page Title: ${document.title}`);
    }

    // Get meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        content.push(`Page Description: ${metaDesc.content}`);
    }

    // Get headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
        if (h.textContent.trim() && !h.closest('.wva-container')) {
            content.push(`${h.tagName}: ${h.textContent.trim()}`);
        }
    });

    // Get main content paragraphs
    const paragraphs = document.querySelectorAll('p, li');
    paragraphs.forEach(p => {
        if (p.textContent.trim().length > 30 && !p.closest('.wva-container')) {
            content.push(`Content: ${p.textContent.trim()}`);
        }
    });

    // Get form labels and inputs
    const formElements = document.querySelectorAll('label, input[placeholder], textarea[placeholder]');
    formElements.forEach(el => {
        if (el.textContent?.trim() || el.placeholder) {
            content.push(`Form: ${el.textContent?.trim() || el.placeholder}`);
        }
    });

    return content.join('\n').substring(0, 5000); // Limit context size
}


        })();

(function() {
            WebVoiceAssistant.SpeechRecognition = {
    setup: function ({ language, onResult }) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.lang = language || 'en-US';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };
        return recognition;
    }
};



        })();

(function() {
            const synthesis = window.speechSynthesis;

WebVoiceAssistant.speak = function(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9
    synthesis.speak(utterance)
}


        })();

(function() {
            WebVoiceAssistant.UIManager = class {
    constructor(config, speak, startListening, stopListening, isListening, getCommand) {
        this.config = config || {};
        this.assistant = {};
        this.messages = [];
        this.speak = speak;
        this.startListening = startListening;
        this.stopListening = stopListening;
        this.isListening = isListening;
        this.getCommand = getCommand;

        // Default configuration
        this.config = {
            position: 'bottom-right',
            buttonSize: 60,
            panelWidth: 350,
            panelHeight: 450,
            ...this.config
        };

        this.injectStyles();
        this.createUI();
        this.bindEvents();
    }

    injectStyles() {
        if (document.getElementById('wva-styles')) return;

        const style = document.createElement('style');
        style.id = 'wva-styles';
        style.textContent = `
            /* Main container */
            .wva-container {
                position: fixed;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            /* Position classes */
            .wva-position-bottom-right { bottom: 20px; right: 20px; }
            .wva-position-bottom-left { bottom: 20px; left: 20px; }
            .wva-position-top-right { top: 20px; right: 20px; }
            .wva-position-top-left { top: 20px; left: 20px; }

            /* Button styles */
            .wva-button {
                width: ${this.config.buttonSize}px;
                height: ${this.config.buttonSize}px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .wva-record-button{
                width: ${this.config.buttonSize}px;
                height: ${this.config.buttonSize}px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .btn-container{
            width:100%;
            padding:4px;
            display: flex;
            align-items: center;
            justify-content: center;
            }

            .wva-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            }

            .wva-record-button.listening {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
                animation: wva-pulse 1.5s infinite;
            }

            .wva-record-button.processing {
                background: linear-gradient(135deg, #feca57, #ff9ff3) !important;
                animation: wva-spin 1s linear infinite;
            }

            /* Icon styles */
            .wva-icon {
                width: 24px;
                height: 24px;
                fill: white;
            }

            /* Chat panel */
            .wva-chat-panel {
                position: absolute;
                width: ${this.config.panelWidth}px;
                height: ${this.config.panelHeight}px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                bottom: ${this.config.buttonSize + 10}px;
                right: 0;
            }

            .wva-chat-panel.active {
                display: flex;
                animation: wva-slideUp 0.3s ease-out;
            }

            /* Chat header */
            .wva-chat-header {
                padding: 16px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                font-weight: 600;
                position: relative;
            }

            .wva-close-btn {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                font-size: 18px;
            }

            /* Messages area */
            .wva-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            /* Message bubbles */
            .wva-message {
                max-width: 80%;
                padding: 10px 14px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.4;
            }

            .wva-message.user {
                background: #667eea;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .wva-message.assistant {
                background: #f1f3f5;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            /* Status bar */
            .wva-status {
                padding: 12px;
                font-size: 12px;
                color: #666;
                text-align: center;
                border-top: 1px solid #eee;
                background: #fafafa;
            }

            .wva-status.listening {
                background: #fff5f5;
                color: #e53e3e;
            }

            .wva-status.processing {
                background: #fffbeb;
                color: #d69e2e;
            }

            .wva-status.ready {
                background: #f5f6ff;
                color: #3547e8;
            }

            /* Animations */
            @keyframes wva-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes wva-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes wva-slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Responsive design */
            @media (max-width: 480px) {
                .wva-chat-panel {
                    width: calc(100vw - 40px);
                    right: 20px !important;
                    left: 20px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = `wva-container wva-position-${this.config.position}`;

        // Create microphone button
        this.button = document.createElement('button');
        this.button.className = 'wva-button';
        this.button.title = 'Start voice interaction';
        this.button.innerHTML = `
           <svg class="wva-icon" viewBox="0 0 24 24">
  <!-- Robot head (main body) -->
  <rect x="6" y="7" width="12" height="10" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
  
  <!-- Antenna -->
  <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" stroke-width="2"/>
  <circle cx="12" cy="3" r="1" fill="currentColor"/>
  
  <!-- Eyes -->
  <circle cx="9.5" cy="11" r="1.5" fill="currentColor"/>
  <circle cx="14.5" cy="11" r="1.5" fill="currentColor"/>
  
  <!-- Mouth/speaker grille -->
  <rect x="8" y="14" width="8" height="2" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="0.5"/>
  
  <!-- Side panels/ears -->
  <rect x="4" y="9" width="2" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="18" y="9" width="2" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
  
  <!-- Neck connector -->
  <rect x="10.5" y="17" width="3" height="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
        `;

        // Create chat panel
        this.chatPanel = document.createElement('div');
        this.chatPanel.className = 'wva-chat-panel';
        this.chatPanel.innerHTML = `
            <div class="wva-chat-header">
                Voice Assistant
                <button class="wva-close-btn" title="Close chat">×</button>
            </div>
            <div class="wva-messages"></div>
            <div class="wva-status">Ready</div>
            <div class="btn-container">
             <button class="wva-record-button">
             <svg class="wva-icon" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            </button>
            </div>
           
        `;

        // Store references
        this.messagesEl = this.chatPanel.querySelector('.wva-messages');
        this.statusEl = this.chatPanel.querySelector('.wva-status');
        this.closeBtn = this.chatPanel.querySelector('.wva-close-btn');
        this.recordBtn = this.chatPanel.querySelector(".wva-record-button")

        // Assemble UI
        this.container.appendChild(this.button);
        this.container.appendChild(this.chatPanel);
        document.body.appendChild(this.container);

        // Add welcome message
        this.addMessage('Hello! How can I help you today?', 'assistant');
    }

    bindEvents() {
        this.recordBtn.addEventListener('click', () => {
            if (this.isListening()) {
                this.stopListening()
                this.updateUI({ isProcessing: true })
            } else {
                this.startListening()
                this.updateUI({ isListening: true })
            }
        });

        this.closeBtn.addEventListener('click', () => this.toggleChat(false));

        // Toggle chat on click
        this.button.addEventListener('click', () => {
            this.toggleChat()
            this.speak('Hello! How can I help you today?')
        });
    }

    addMessage(text, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `wva-message ${sender}`;
        messageEl.textContent = text;
        this.messagesEl.appendChild(messageEl);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    updateStatus(text, state) {
        this.statusEl.textContent = text;
        this.statusEl.className = 'wva-status' + (state ? ` ${state}` : '');
    }

    toggleChat(forceState) {
        const shouldOpen = forceState !== undefined ? forceState : !this.chatPanel.classList.contains('active');
        this.chatPanel.classList.toggle('active', shouldOpen);
    }

    setCommand(text) {
        this.userCommand = text;
        console.log(this.userCommand, " < this is what you said")
    }

    updateUI(state) {
        this.recordBtn.className = 'wva-record-button';

        if (state.isListening) {
            this.recordBtn.classList.add('listening');
            this.updateStatus('Listening...', 'listening');
        } else if (state.isProcessing) {
            this.button.classList.add('processing');
            this.updateStatus('Processing...', 'processing');
        } else if (state.isReady) {
            this.updateStatus('Asistant Responded', "ready");
        }
    }
};

// Export for Node.js
        })();
    
    // Main class - assign to namespace instead of class declaration
    (function() {
        WebVoiceAssistant.WebVoiceAssistant = class {
    constructor(options = {}) {
        this.recognition = WebVoiceAssistant.SpeechRecognition
            ? WebVoiceAssistant.SpeechRecognition.setup({
                language: options.language || 'en-US',
                onResult: (text) => this.processcommand(text)
            })
            : null;
        this.speak = WebVoiceAssistant.speak
            ? WebVoiceAssistant.speak
            : function () { };
        this._userCommand = "";
        this.ui = new WebVoiceAssistant.UIManager(options, this.speak, this.startListening, this.stopListening, () => this.listening, () => this.userCommand);
        this.listening = false;
        this.context = WebVoiceAssistant.extractPageContext();

        this.aiConfig = {
            geminiApiKey: options.geminiApiKey || (typeof window !== 'undefined' ? window.__WEBVOICEASSISTANT_CONFIG__?.geminiApiKey : undefined),
            model: options.model || 'gemini-1.5-flash', // Default Gemini model
            maxTokens: options.maxTokens || 200,
            temperature: options.temperature || 0.7,
            ...options.aiConfig
        }

        // Rate limiting configuration
        this.rateLimitConfig = {
            maxRetries: 3,
            baseDelay: 1000, // 1 second
            maxDelay: 30000, // 30 seconds
            ...options.rateLimitConfig
        };

        if (this.aiConfig.geminiApiKey) {
            this.gemini = this.createGeminiClient();
        }

        if (!this.recognition) {
            alert("Speech recognition is not supported in this browser.");
        }
    }

    get userCommand() {
        return this._userCommand;
    }

    // Helper function for exponential backoff delay
    sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Calculate delay with exponential backoff
    calculateDelay = (attempt) => {
        const delay = this.rateLimitConfig.baseDelay * Math.pow(2, attempt);
        return Math.min(delay, this.rateLimitConfig.maxDelay);
    };

    createGeminiClient = () => {
        return {
            generateContent: async (params) => {
                let lastError;

                for (let attempt = 0; attempt <= this.rateLimitConfig.maxRetries; attempt++) {
                    try {
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.aiConfig.model}:generateContent?key=${this.aiConfig.geminiApiKey}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                contents: params.contents,
                                generationConfig: {
                                    temperature: params.temperature || this.aiConfig.temperature,
                                    maxOutputTokens: params.maxOutputTokens || this.aiConfig.maxTokens,
                                    topP: 0.8,
                                    topK: 10
                                },
                                safetySettings: [
                                    {
                                        category: "HARM_CATEGORY_HARASSMENT",
                                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                                    },
                                    {
                                        category: "HARM_CATEGORY_HATE_SPEECH",
                                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                                    },
                                    {
                                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                                    },
                                    {
                                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                                    }
                                ]
                            })
                        });

                        if (response.ok) {
                            return await response.json();
                        }

                        // Handle rate limiting (429) and server errors (5xx)
                        if (response.status === 429 || response.status >= 500) {
                            lastError = new Error(`Gemini API error: ${response.status} - ${response.statusText}`);

                            if (attempt < this.rateLimitConfig.maxRetries) {
                                const delay = this.calculateDelay(attempt);
                                console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${this.rateLimitConfig.maxRetries})`);
                                await this.sleep(delay);
                                continue;
                            }
                        } else {
                            // For other errors (401, 400, etc.), don't retry
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
                        }
                    } catch (error) {
                        lastError = error;

                        // Only retry on network errors or rate limiting
                        if (attempt < this.rateLimitConfig.maxRetries &&
                            (error.message.includes('429') || error.name === 'TypeError')) {
                            const delay = this.calculateDelay(attempt);
                            console.log(`Request failed. Retrying in ${delay}ms... (attempt ${attempt + 1}/${this.rateLimitConfig.maxRetries})`);
                            await this.sleep(delay);
                            continue;
                        } else {
                            break;
                        }
                    }
                }

                throw lastError;
            }
        }
    }

    generateAiResponse = async (command, Context) => {
        if (!this.gemini) {
            return "Please provide a Gemini API key to enable AI responses."
        }

        try {
            const response = await this.gemini.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `You are a helpful voice assistant. Current page context: ${Context}\n\nUser command: ${command}`
                            }
                        ]
                    }
                ],
                temperature: this.aiConfig.temperature,
                maxOutputTokens: this.aiConfig.maxTokens
            });

            // Extract text from Gemini response
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                const parts = response.candidates[0].content.parts;
                if (parts && parts[0] && parts[0].text) {
                    return parts[0].text;
                }
            }

            return "I received an empty response. Please try again.";

        } catch (error) {
            console.error('Gemini Error:', error);

            // Provide more specific error messages
            if (error.message.includes('429')) {
                return "Sorry, I'm receiving too many requests right now. Please try again in a moment.";
            } else if (error.message.includes('401') || error.message.includes('403')) {
                return "API key authentication failed. Please check your Gemini API key.";
            } else if (error.message.includes('400')) {
                return "Invalid request format. Please try rephrasing your command.";
            } else if (error.message.includes('SAFETY')) {
                return "I can't process that request due to safety guidelines. Please try a different command.";
            } else {
                return "I encountered an error processing your request. Please try again.";
            }
        }
    }

    startListening = () => {
        if (this.recognition) {
            this.listening = true;
            this._userCommand = "";
            this.recognition.start();
            console.log("started")
        }
    }

    stopListening = () => {
        if (this.recognition) {
            this.listening = false
            this.recognition.stop()
            console.log("stopped")
        }
    }

    processcommand = async (text) => {
        console.log("You said this:", text);
        this._userCommand = text;
        this.ui.setCommand(text);
        this.ui.addMessage(text, "user");

        const context = WebVoiceAssistant.extractPageContext
            ? WebVoiceAssistant.extractPageContext()
            : "";

        const value = await this.generateAiResponse(text, context)
        if (value) {
            this.ui.updateUI({ isReady: true })
            this.ui.addMessage(value, "assistant")
            this.speak(value)
        }

    }
}


    })();
    
    // Export to window if available
    if (typeof window !== 'undefined') {
        window.WebVoiceAssistant = WebVoiceAssistant.WebVoiceAssistant;
    }
})();