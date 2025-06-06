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