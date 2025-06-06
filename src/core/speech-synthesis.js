const synthesis = window.speechSynthesis;

function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9
    synthesis.speak(utterance)
}

if (typeof exports !== "undefined") {
    exports.speak = speak
}