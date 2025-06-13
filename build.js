const fs = require('fs');
const path = require('path');
const { argv } = require('process');

// Get build format from command line
const format = argv.includes('--format=cjs') ? 'cjs' :
    argv.includes('--format=esm') ? 'esm' :
        argv.includes('--format=umd') ? 'umd' : 'cjs';

// 1. Read all core files
const coreFiles = fs.readdirSync("./src/core").map(file => {
    return fs.readFileSync(`./src/core/${file}`, "utf8");
});

// 2. Read main file
const mainFile = fs.readFileSync("./src/index.js", "utf8");

// 3. Process files
const processFile = (content) => {
    return content
        .replace(/function speak\(/g, 'WebVoiceAssistant.speak = function(')
        .replace(/function cancelSpeak\(/g, 'WebVoiceAssistant.cancelSpeak = function(')
        .replace(/class (\w+)/g, 'WebVoiceAssistant.$1 = class')
        .replace(/function extractPageContext\(/g, 'WebVoiceAssistant.extractPageContext = function(')
        .replace(/const \{[^}]+\} = require\([^)]+\);?/g, '')
        .replace(/class WebVoiceAssistant/g, 'WebVoiceAssistant.WebVoiceAssistant = class');
};

// 4. Create core bundle
const coreBundle = coreFiles.map(file => {
    return `(function() {
        ${processFile(file)}
    })();`;
}).join('\n\n');

// 5. Create main bundle
const mainBundle = `(function() {
    ${processFile(mainFile)}
})();`;

// 6. Combine bundles
const fullBundle = `// WebVoiceAssistant v${require('./package.json').version}
var WebVoiceAssistant = {};

${coreBundle}

${mainBundle}

// Universal export pattern
if (typeof window !== 'undefined') {
    window.WebVoiceAssistant = WebVoiceAssistant.WebVoiceAssistant;
}`;

// 7. Format-specific wrappers
const wrappers = {
    cjs: `// CommonJS
(function() {
    ${fullBundle}
    module.exports = WebVoiceAssistant.WebVoiceAssistant;
})();`,

    esm: `// ES Module
${fullBundle.replace('window.WebVoiceAssistant =', 'export default')};`,

    umd: `// UMD
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.WebVoiceAssistant = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    ${fullBundle}
    return WebVoiceAssistant.WebVoiceAssistant;
}));`
};

// 8. Create dist directory
if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");

// 9. Write the appropriate bundle
const outputFile = format === 'cjs' ? 'web-voice-assistant.cjs.js' :
    format === 'esm' ? 'web-voice-assistant.esm.js' :
        'web-voice-assistant.umd.js';

fs.writeFileSync(`./dist/${outputFile}`, wrappers[format]);

console.log(`Successfully built ${outputFile} (${format.toUpperCase()} format)`);

// 10. Generate TypeScript declarations if ESM build
if (format === 'esm') {
    const dtsContent = `declare class WebVoiceAssistant {
        constructor(options: {
           geminiApiKey: string;
           model?: string;        
           maxTokens?: number;           
           temperature?: number;          
           language?: string;          
           rate?: number;
           pitch?: number;
           contextSize?: number;
           ButtonBackGroundColour?: string;
           position?: 'bottom-left' | 'bottom-right';
           buttonSize?: number;
           svgColor?: string;
           textColor?: string;
           panelHeight?: number;
           panelWidth?: number;
           PanelBackgroundColor?: string;
           MessagesBackgroundColor?: string;
        });
        
    }
    
    export default WebVoiceAssistant;
    `;

    fs.writeFileSync("./dist/index.d.ts", dtsContent);
}