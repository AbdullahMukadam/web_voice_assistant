const synthesis = window.speechSynthesis;

function speak(text, { language, rate } = {}) {
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

function cancelSpeak() {
    synthesis.cancel()
}

if (typeof exports !== "undefined") {
    exports.speak = speak
    exports.cancelSpeak = cancelSpeak
}