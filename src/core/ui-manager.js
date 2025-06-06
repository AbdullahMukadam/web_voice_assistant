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
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager: WebVoiceAssistant.UIManager };
}