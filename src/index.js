class WebVoiceAssistant {
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