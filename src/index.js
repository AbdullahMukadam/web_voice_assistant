class WebVoiceAssistant {
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
                                text: `You are a helpful voice assistant. Current page context: ${Context}\n\nUser command: ${command}, also please dont include this ** in response`
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

if (typeof window !== 'undefined') {
    window.WebVoiceAssistant = WebVoiceAssistant;
}