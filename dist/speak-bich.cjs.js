// CommonJS
(function() {
    // speak-bich v1.0.6
var WebVoiceAssistant = {};

(function() {
        WebVoiceAssistant.extractPageContext = function(contextSize) {
    const content = [];


    if (document.title) {
        content.push(`Page Title: ${document.title}`);
    }


    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        content.push(`Page Description: ${metaDesc.content}`);
    }


    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
        if (h.textContent.trim() && !h.closest('.wva-container')) {
            content.push(`${h.tagName}: ${h.textContent.trim()}`);
        }
    });


    const paragraphs = document.querySelectorAll('p, li');
    paragraphs.forEach(p => {
        if (p.textContent.trim().length > 30 && !p.closest('.wva-container')) {
            content.push(`Content: ${p.textContent.trim()}`);
        }
    });


    const formElements = document.querySelectorAll('label, input[placeholder], textarea[placeholder]');
    formElements.forEach(el => {
        if (el.textContent?.trim() || el.placeholder) {
            content.push(`Form: ${el.textContent?.trim() || el.placeholder}`);
        }
    });

    return content.join('\n').substring(0, contextSize || 5000);
}

if (typeof exports !== "undefined") {
    exports.extractPageContext = extractPageContext
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


if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebVoiceAssistant.SpeechRecognition;
}
    })();

(function() {
        const synthesis = window.speechSynthesis;

WebVoiceAssistant.speak = function(text, { language, rate } = {}) {
    return new Promise((resolve) => {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate || 0.9;
        utterance.lang = language || 'en-US';
        synthesis.speak(utterance)
        utterance.onend = () => {
            resolve(false)
        }
    })

}

WebVoiceAssistant.cancelSpeak = function() {
    synthesis.cancel()
}

if (typeof exports !== "undefined") {
    exports.speak = speak
    exports.cancelSpeak = cancelSpeak
}
    })();

(function() {
        WebVoiceAssistant.UIManager = class {
    constructor(config, speak, startListening, stopListening, isListening, getCommand, cancelSpeak, speechConfig) {
        this.assistant = {};
        this.messages = [];
        this.speak = speak;
        this.startListening = startListening;
        this.stopListening = stopListening;
        this.isListening = isListening;
        this.getCommand = getCommand;
        this.isCancelBtnVisible = false;
        this.cancelSpeak = cancelSpeak;
        this.speechConfig = speechConfig || {};


        this.config = {
            ButtonBackGroundColour: config.ButtonBackGroundColour || "black",
            svgColor: config.svgColor || "white",
            textColor: config.textColor || "white",
            position: config.position || 'bottom-right',
            buttonSize: config.buttonSize || 60,
            panelWidth: config.panelWidth || 350,
            panelHeight: config.panelHeight || 450,
            PanelBackgroundColor: config.PanelBackgroundColor || "rgb(24 24 27)",
            MessagesBackgroundColor: config.MessagesBackgroundColor || "rgb(24 24 27)"
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
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                background: ${this.config.ButtonBackGroundColour};
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3),
                           0 4px 16px rgba(118, 75, 162, 0.2),
                           inset 0 1px 2px rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                overflow: hidden;
            }
            
            .wva-button::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
               
                transform: rotate(-45deg);
                transition: all 0.6s;
                opacity: 0;
            }
            
            .wva-button:hover::before {
                opacity: 1;
                animation: wva-shimmer 1.5s ease-in-out;
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
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                background: black;
                box-shadow: 0 6px 24px rgba(102, 126, 234, 0.25),
                           0 3px 12px rgba(118, 75, 162, 0.15),
                           inset 0 1px 2px rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                overflow: hidden;
            }
            
            .wva-record-button::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                transform: rotate(-45deg);
                transition: all 0.6s;
                opacity: 0;
            }

            .btn-container{
                width: 100%;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${this.config.PanelBackgroundColor};
                border-top: 1px solid rgba(102, 126, 234, 0.1);
            }

            .wva-button:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4),
                           0 6px 20px rgba(118, 75, 162, 0.3),
                           inset 0 1px 2px rgba(255, 255, 255, 0.2);
            }
            
            .wva-record-button:hover {
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.35),
                           0 4px 16px rgba(118, 75, 162, 0.25);
            }

            .wva-record-button.listening {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
                box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4),
                           0 4px 16px rgba(238, 90, 36, 0.3),
                           inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
                animation: wva-pulse 1.5s infinite;
            }

            .wva-record-button.processing {
                background: linear-gradient(135deg, #feca57, #ff9ff3) !important;
                box-shadow: 0 8px 32px rgba(254, 202, 87, 0.4),
                           0 4px 16px rgba(255, 159, 243, 0.3),
                           inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
                animation: wva-spin 1s linear infinite;
            }

            /* Icon styles */
            .wva-icon {
                width: 24px;
                height: 24px;
                fill: white;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
                transition: all 0.3s ease;
            }
            
            .wva-button:hover .wva-icon,
            .wva-record-button:hover .wva-icon {
                transform: scale(1.1);
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            }

            .overlay-chat-panel{
             height: ${this.config.panelHeight}px;
             width: ${this.config.panelWidth}px;
             position: absolute;
             background-color:#edebe4;
             display:none;
             z-index:49;
             opacity: 0;
             transform: scale(0.95) translateY(-10px);
             transition: opacity 0.3s ease, transform 0.3s ease;
            }

            .overlay-content-container{
             height: 100%;
             width: 100%;
             display:flex;
             flex-direction: column;
             justify-content:space-between;
             align-items:center;
            }

            .command{
             height: 50%;
             width: 100%;
             display:flex;
             justify-content:center;
             align-items:center;
            }

            .gif{
             width: 100%;
             height:50%;
             display:flex;
             align-items: center;
             justify-content:center;
             flex-direction:column;
             gap:5px;
            }

            .gif img{
             height: 180px;
             width: 180px;
             z-index:60;
             
            }

            .gif p{
             font-size:14px;
             text-align:center;
             color: red;
             font-weight: 400;
             animation: bounce 2s infinite;
            }

            @keyframes bounce {
             0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
                opacity: 1;
              }
            	40% {
                transform: translateY(-15px);
              }
            	60% {
                transform: translateY(-8px);
              }
            }

            .command-text {
              font-weight: 600;
              font-size: 18px;
              letter-spacing: 0.5px;
              opacity: 1;
              color:black;
            }

            .command-text.fade-in {
                opacity: 0;
                animation: fadeIn 2s ease-in-out forwards;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            /* Chat panel */
            .wva-chat-panel {
                position: absolute;
                width: ${this.config.panelWidth}px;
                height: ${this.config.panelHeight}px;
                background: ${this.config.PanelBackgroundColor};
                backdrop-filter: blur(20px);
                border-radius: 20px;
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12),
                           0 12px 40px rgba(0, 0, 0, 0.08),
                           0 6px 20px rgba(0, 0, 0, 0.04),
                           inset 0 1px 2px rgba(255, 255, 255, 0.8);
                display: none;
                flex-direction: column;
                overflow: hidden;
                bottom: ${this.config.buttonSize + 15}px;
                ${this.config.position === "bottom-left" ? "left: 0;" : "right:0;"}
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .wva-chat-panel.active {
                display: flex;
                animation: wva-slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* Chat header */
            .wva-chat-header {
                padding: 20px;
                background:  ${this.config.PanelBackgroundColor};
                color: ${this.config.textColor};
                font-weight: 600;
                position: relative;
                font-size: 16px;
                letter-spacing: 0.5px;
            }
            

            .wva-close-btn {
                position: absolute;
                top: 16px;
                right: 20px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                color: ${this.config.textColor};
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .wva-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            /* Messages area */
            .wva-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: ${this.config.MessagesBackgroundColor};
            }
            
            .wva-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .wva-messages::-webkit-scrollbar-track {
                background: rgba(102, 126, 234, 0.05);
                border-radius: 3px;
            }
            
            .wva-messages::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 3px;
            }

            /* Message bubbles */
            .wva-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                position: relative;
                word-wrap: break-word;
                animation: wva-messageSlide 0.3s ease-out;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                backdrop-filter: blur(10px);
                background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            }

            .wva-message.user {
                background:  rgb(9 9 11);
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 6px;
            }
            
            .wva-message.user::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
                border-radius: inherit;
                pointer-events: none;
            }

            .wva-message.assistant {
                background: rgba(45, 55, 72, 0.8);
                border: 1px solid rgba(102, 126, 234, 0.2);
                color: #e2e8f0;
                align-self: flex-start;
                border-bottom-left-radius: 6px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            }

            /* Status bar */
            /* Actions container */
            .wva-actions-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-top: 1px solid rgba(102, 126, 234, 0.1);
                background:  ${this.config.PanelBackgroundColor};
                gap: 12px;
            }

            .wva-status {
                font-size: 13px;
                font-weight: 500;
                color: #4a5568;
                letter-spacing: 0.3px;
                position: relative;
                flex: 1;
                text-align: left;
            }
            
            .wva-status::before {
                content: '';
                position: absolute;
                top: -16px;
                left: 0;
                width: 40px;
                height: 2px;
            }

            /* Cancel Speech Button */
            .cancel-speech-btn {
                padding: 8px 16px;
                border: 1px solid rgba(102, 126, 234, 0.2);
                border-color: rgba(102, 126, 234, 0.3);
                border-radius: 12px;
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                backdrop-filter: blur(10px);
                letter-spacing: 0.3px;
                text-transform: uppercase;
                display: none;
            }
            
            
            .cancel-speech-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(102, 126, 234, 0.1);
            }

            .wva-status.listening {
               
                color: #e53e3e;
                animation: wva-statusPulse 2s infinite;
            }

            .wva-status.processing {
               
                color: #d69e2e;
                animation: wva-statusWave 1.5s infinite;
            }

            .wva-status.ready {
                
                color: #38a169;
            }
            
           

            /* Enhanced Animations */
            @keyframes wva-pulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4),
                               0 4px 16px rgba(238, 90, 36, 0.3),
                               0 0 0 0 rgba(255, 107, 107, 0.7);
                }
                50% { 
                    transform: scale(1.05);
                    box-shadow: 0 12px 40px rgba(255, 107, 107, 0.5),
                               0 6px 20px rgba(238, 90, 36, 0.4),
                               0 0 0 10px rgba(255, 107, 107, 0);
                }
            }

            @keyframes wva-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes wva-shimmer {
                0% { transform: translateX(-100%) rotate(-45deg); }
                100% { transform: translateX(100%) rotate(-45deg); }
            }

            @keyframes wva-slideUp {
                from { 
                    opacity: 0; 
                    transform: translateY(30px) scale(0.95);
                    filter: blur(5px);
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1);
                    filter: blur(0);
                }
            }
            
            @keyframes wva-messageSlide {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes wva-statusPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes wva-statusWave {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-2px); }
                75% { transform: translateX(2px); }
            }

            /* Responsive design */
            @media (max-width: 480px) {
                .wva-chat-panel {
                    width: calc(100vw - 40px);
                    right: 20px !important;
                    left: 20px !important;
                    height: calc(100vh - 120px);
                    max-height: ${this.config.panelHeight}px;
                }
                
                .wva-messages {
                    padding: 16px;
                }
                
                .wva-chat-header {
                    padding: 16px;
                }
            }
            
           
        `;
        document.head.appendChild(style);
    }

    createUI() {

        this.container = document.createElement('div');
        this.container.className = `wva-container wva-position-${this.config.position}`;


        this.button = document.createElement('button');
        this.button.className = 'wva-button';
        this.button.title = 'Start voice interaction';
        this.button.innerHTML = `
          <svg class="wva-icon" viewBox="0 0 24 24">
  <!-- Robot head (main body) -->
  <rect x="6" y="7" width="12" height="10" rx="2" ry="2" fill="none" stroke="${this.config.svgColor}" stroke-width="2"/>
  
  <!-- Antenna -->
  <line x1="12" y1="3" x2="12" y2="7" stroke="${this.config.svgColor}" stroke-width="2"/>
  <circle cx="12" cy="3" r="1" fill="${this.config.svgColor}"/>
  
  <!-- Eyes -->
  <circle cx="9.5" cy="11" r="1.5" fill="${this.config.svgColor}"/>
  <circle cx="14.5" cy="11" r="1.5" fill="${this.config.svgColor}"/>
  
  <!-- Mouth/speaker grille -->
  <rect x="8" y="14" width="8" height="2" rx="1" fill="none" stroke="${this.config.svgColor}" stroke-width="1.5"/>
  <line x1="9" y1="15" x2="15" y2="15" stroke="${this.config.svgColor}" stroke-width="0.5"/>
  
  <!-- Side panels/ears -->
  <rect x="4" y="9" width="2" height="4" rx="1" fill="none" stroke="${this.config.svgColor}" stroke-width="1.5"/>
  <rect x="18" y="9" width="2" height="4" rx="1" fill="none" stroke="${this.config.svgColor}" stroke-width="1.5"/>
  
  <!-- Neck connector -->
  <rect x="10.5" y="17" width="3" height="2" fill="none" stroke="${this.config.svgColor}" stroke-width="1.5"/>
</svg>
        `;


        this.chatPanel = document.createElement('div');
        this.chatPanel.className = 'wva-chat-panel';
        this.chatPanel.innerHTML = `
           <div class="overlay-chat-panel">
            <div class="overlay-content-container">
             <div class="command">
             <p class="command-text"></p>
            </div>
            <div class="gif"> 
            <p>Listening..</p>
              <img src="https://res.cloudinary.com/dhbs6k3ue/image/upload/v1749807636/yy3_a3p4as.gif" alt="gif" />
            </div>
            </div>
           </div>
            <div class="wva-chat-header">
                Voice Assistant
                <button class="wva-close-btn" title="Close chat">×</button>
            </div>
            <div class="wva-messages"></div>
            <div class="wva-actions-container">
                <div class="wva-status"></div>
                <button class="cancel-speech-btn">Cancel Speech</button>
            </div>
            <div class="btn-container">
             <button class="wva-record-button">
             <svg class="wva-icon" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            </button>
            </div>
           
        `;


        this.messagesEl = this.chatPanel.querySelector('.wva-messages');
        this.statusEl = this.chatPanel.querySelector('.wva-status');
        this.closeBtn = this.chatPanel.querySelector('.wva-close-btn');
        this.recordBtn = this.chatPanel.querySelector(".wva-record-button")
        this.cancelSpeechBtn = this.chatPanel.querySelector(".cancel-speech-btn");
        this.actionsContainer = this.chatPanel.querySelector(".wva-actions-container");
        this.chatPanelOverlay = this.chatPanel.querySelector(".overlay-chat-panel");
        this.commandtext = this.chatPanel.querySelector(".command-text");


        this.container.appendChild(this.button);
        this.container.appendChild(this.chatPanel);
        document.body.appendChild(this.container);


        this.addMessage('Hello! How can I help you today?', 'assistant');
    }

    bindEvents() {
        this.recordBtn.addEventListener('click', () => {
            if (!this.isListening()) {
                this.chatPanelOverlay.style.display = "block"
                requestAnimationFrame(() => {
                    this.chatPanelOverlay.style.opacity = "1";
                    this.chatPanelOverlay.style.transform = "scale(1) translateY(0)";
                })
                this.startListening()
                this.updateUI({ isListening: true })
            }
        });

        this.closeBtn.addEventListener('click', () => this.toggleChat(false));

        this.cancelSpeechBtn.addEventListener('click', () => {
            this.cancelSpeak();
            this.updateCancelBtnStatus(false)
            this.updateUI({ isReady: true });
            console.log('Speech cancelled');
        });


        this.button.addEventListener('click', () => {
            this.toggleChat()
            this.updateCancelBtnStatus(true)
            this.speak('Hello! How can I help you today?', { language: this.speechConfig.language, rate: this.speechConfig.rate }).then((status) => {
                if (status === false) {
                    this.updateCancelBtnStatus(false)
                    console.log(status)
                }
            })
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
        this.actionsContainer.className = 'wva-actions-container' + (state ? ` ${state}` : '');
    }

    toggleChat(forceState) {
        const shouldOpen = forceState !== undefined ? forceState : !this.chatPanel.classList.contains('active');
        this.chatPanel.classList.toggle('active', shouldOpen);
    }

    setCommand(text) {
        this.userCommand = text;
        this.commandtext.textContent = text;
        this.commandtext.classList.add("fade-in")
        setTimeout(() => {
            this.chatPanelOverlay.style.opacity = "0";
            this.chatPanelOverlay.style.transform = "scale(0.95) translateY(-10px)";
            this.chatPanelOverlay.style.display = "none";
            this.commandtext.textContent = "";
            this.stopListening();
            this.updateUI({ isProcessing: true });

        }, 2000)
        //console.log(this.userCommand, " < this is what you said")
    }

    updateCancelBtnStatus(shouldShow) {
        this.isCancelBtnVisible = shouldShow;
        this.cancelSpeechBtn.style.display = shouldShow ? "block" : "none";
    }

    updateUI(state) {
        this.recordBtn.className = 'wva-record-button';
        if (state.isListening) {
            this.updateStatus('Listening...', 'listening');
        } else if (state.isProcessing) {
            this.button.classList.add('processing');
            this.updateStatus('Processing...', 'processing');
        } else if (state.isReady) {
            this.updateStatus('Asistant Responded', "ready");
        }
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager: WebVoiceAssistant.UIManager };
}
    })();

(function() {
    WebVoiceAssistant.WebVoiceAssistant = class {
    constructor(options = {}) {

        this.speechConfig = {
            language: options.language || 'en-US',
            rate: options.rate || 0.9
        }

        this.contextConfig = {
            contextSize: options.contextSize || 5000
        }


        this.recognition = WebVoiceAssistant.SpeechRecognition
            ? WebVoiceAssistant.SpeechRecognition.setup({
                language: this.speechConfig.language,
                onResult: (text) => this.processcommand(text)
            })
            : null;

        this.speak = WebVoiceAssistant.speak
            ? WebVoiceAssistant.speak
            : function () { };

        this.cancelSpeak = WebVoiceAssistant.cancelSpeak
            ? WebVoiceAssistant.cancelSpeak
            : function () { };

        this.ui = new WebVoiceAssistant.UIManager(options, this.speak, this.startListening, this.stopListening, () => this.listening, () => this.userCommand, this.cancelSpeak, this.speechConfig);

        this._userCommand = "";
        this.listening = false;
        this.context = WebVoiceAssistant.extractPageContext(options.contextSize || 5000);


        this.aiConfig = {
            geminiApiKey: options.geminiApiKey || (typeof window !== 'undefined' ? window.__WEBVOICEASSISTANT_CONFIG__?.geminiApiKey : undefined),
            model: options.model || 'gemini-1.5-flash',
            maxTokens: options.maxTokens || 200,
            temperature: options.temperature || 0.7,
        }

        if (!this.recognition) {
            alert("Speech recognition is not supported in this browser.");
        }
    }

    get userCommand() {
        return this._userCommand;
    }

    generateAiResponse = async (command, Context) => {
        if (!this.aiConfig.geminiApiKey) {
            return "Please provide a Gemini API key to enable AI responses."
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.aiConfig.model}:generateContent?key=${this.aiConfig.geminiApiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `You are a helpful voice assistant. Current page context: ${Context}\n\nUser command: ${command}, also please dont include this ** in response`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: this.aiConfig.temperature,
                        maxOutputTokens: this.aiConfig.maxTokens
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();


            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const parts = data.candidates[0].content.parts;
                if (parts && parts[0] && parts[0].text) {
                    return parts[0].text;
                }
            }

            return "I received an empty response. Please try again.";

        } catch (error) {
            console.error('Gemini Error:', error);
            return "I encountered an error processing your request. Please try again.";
        }
    }

    startListening = () => {
        if (this.recognition) {
            this.listening = true;
            this._userCommand = "";
            this.recognition.start();
        }
    }

    stopListening = () => {
        if (this.recognition) {
            this.listening = false
            this.recognition.stop()
        }

    }

    destroy = () => {
        if (this.recognition) {
            this.stopListening();

            if (this.recognition.abort) {
                this.recognition.abort();
            }

            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition = null;
        }

        this.speak = null;
        this.cancelSpeak = null;
        this.ui = null;
        this._userCommand = null;
        this.context = null;
    }

    processcommand = async (text) => {
        this._userCommand = text;
        this.ui.setCommand(text);
        this.ui.addMessage(text, "user");

        const context = WebVoiceAssistant.extractPageContext
            ? WebVoiceAssistant.extractPageContext(this.contextConfig.contextSize || 5000)
            : "";

        const value = await this.generateAiResponse(text, context)
        if (value) {
            setTimeout(() => {
                this.ui.updateUI({ isReady: true })
                this.ui.addMessage(value, "assistant")
                this.speak(value, { language: this.speechConfig.language, rate: this.speechConfig.rate }).then((status) => {
                    if (status === false) {
                        this.ui.updateCancelBtnStatus(status)
                    }
                })
                this.ui.updateCancelBtnStatus(true)
            }, 1500)
        }
    }
}

if (typeof window !== 'undefined') {
    window.WebVoiceAssistant = WebVoiceAssistant;
}
})();

// Universal export pattern
if (typeof window !== 'undefined') {
    window.WebVoiceAssistant = WebVoiceAssistant.WebVoiceAssistant;
}
    module.exports = WebVoiceAssistant.WebVoiceAssistant;
})();