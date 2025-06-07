const fs = require('fs');
const path = require('path');

// 1. Read all core files
const coreFiles = fs.readdirSync("./src/core").map(file =>
    fs.readFileSync(`./src/core/${file}`, "utf8")
);

// 2. Read main file
const mainFile = fs.readFileSync("./src/index.js", "utf8");

// 3. Create properly scoped bundle
const bundle = `(function() {
    // Use the global window object if available, otherwise fallback to a local object
    var globalObj = (typeof window !== 'undefined') ? window : this;
    globalObj.WebVoiceAssistant = globalObj.WebVoiceAssistant || {};
    var WebVoiceAssistant = globalObj.WebVoiceAssistant;
    
    // Core modules - wrap each in IIFE to prevent collisions
    ${coreFiles.map(file => {
        let processedFile = file
            // Remove Node.js exports
            .replace(/if \(typeof module !== 'undefined' && module\.exports\) {[^}]+}/g, '')
            .replace(/if \(typeof exports !== "undefined"\) {[^}]+}/g, '')
            // Fix function assignments to WebVoiceAssistant namespace
            .replace(/function speak\(/g, 'WebVoiceAssistant.speak = function(')
            //
            .replace(/function cancelSpeak\(/g, 'WebVoiceAssistant.cancelSpeak = function(')
            // Fix class assignments
            .replace(/class (\w+)/g, 'WebVoiceAssistant.$1 = class')
            // Remove extra closing braces and semicolons
            .replace(/^\s*;\s*}\s*$/gm, '')
            // Fix extractPageContext function
            .replace(/function extractPageContext\(/g, 'WebVoiceAssistant.extractPageContext = function(');
        
        return `(function() {
            ${processedFile}
        })();`;
    }).join('\n\n')}
    
    // Main class - assign to namespace instead of class declaration
    (function() {
        ${mainFile
            // Remove require statements
            .replace(/const \{[^}]+\} = require\([^)]+\);?/g, '')
           
            // Remove Node.js exports
            .replace(/if \(typeof module !== 'undefined' && module\.exports\) {[^}]+}/g, '')
            // Remove window export (we do it below)
            .replace(/if \(typeof window !== 'undefined'\) {[^}]+}/g, '')
            // Convert class to namespace assignment
            .replace(/class WebVoiceAssistant/g, 'WebVoiceAssistant.WebVoiceAssistant = class')
        }
    })();
    
    // Export to window if available
    if (typeof window !== 'undefined') {
        window.WebVoiceAssistant = WebVoiceAssistant.WebVoiceAssistant;
    }
})();`;

// 4. Create dist directory if needed
if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");

// 5. Write bundle
fs.writeFileSync("./dist/web-voice-assistant.js", bundle);
console.log('Build complete!');