# WebVoiceAssistant 🎙️

[![npm version](https://img.shields.io/npm/v/web-voice-assistant)](https://www.npmjs.com/package/web-voice-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight voice assistant for web applications with AI response capabilities using the Web Speech API.

## Features ✨

- 🗣️ Speech recognition (voice-to-text)
- 🔊 Text-to-speech synthesis
- 🤖 Gemini AI integration
- 🌐 Cross-browser support
- ⚡ No dependencies

## Installation 📦

### Via npm
```bash
npm install web-voice-assistant
```
### Via CDN (Browser)
<script src="https://cdn.jsdelivr.net/npm/web-voice-assistant@latest/dist/web-voice-assistant.js"></script>
<!-- or -->
<script src="https://unpkg.com/web-voice-assistant"></script>

### Usage for Npm

const assistant = new WebVoiceAssistant({
    geminiApiKey : "",   //required
      language: 'en-US',  //optional: english by default
      contextSize: 5000,   //optional: context size in words.
      position: "bottom-left",  //optional: position of the panel
});

    more properties avalaible check below

### Usage for Cdn (Browser)
 (Recommeded)
 <script>
    // Configure before loading your script like this
    window.__WEBVOICEASSISTANT_CONFIG__ = {
      geminiApiKey: ""
    };
  </script>
<script src="https://cdn.jsdelivr.net/npm/web-voice-assistant@latest/dist/web-voice-assistant.js"></script>
<!-- or -->
<script src="https://unpkg.com/web-voice-assistant"></script>

After Configuration use it like this:

const assistant = new WebVoiceAssistant({
      language: 'en-US',
      contextSize: 5000,
      position: "bottom-left",
});

### Configurations

| Option | Type | Default | Description | Importance |
|--------|------|---------|-------------|------------|
| `geminiApiKey` | string | `undefined` | Required for AI responses | required |
| `model` | string | `gemini-1.5-flash` | Gemini AI Model | optional |
| `maxTokens` | number | `200` | Maximum Tokens for Model | optional |
| `temperature` | number | `0.7` | Temperature for model | optional |
| `language` | string | `'en-US'` | Speech recognition/synthesis language | optional |
| `rate` | number | `0.9` | Speech speed (0.1-2) | optional |
| `pitch` | number | `1` | Voice pitch (0-2) | optional |
| `contextSize` | number | `5000` | Context size in number of words | optional |
| `ButtonBackGroundColour` | string | `black` | Background Color for floating button | optional |
| `position` | string | `bottom-right` | Position of Floating button, available positions are (bottom-left or bottom-right) | optional |
| `buttonSize` | number | `60` | Floating Button Size in px | optional |
| `svgColor` | string | `white` | Color for robot svg on the floating button | optional |
| `textColor` | string | `white` | Color for the header text | optional |
| `panelHeight` | number | `450` | Height of the Panel | optional |
| `panelWidth` | number | `350` | Width of the Panel | optional |
| `PanelBackgroundColor` | string | `rgb(24 24 27)` | Background Color of the panel | optional |
| `MessagesBackgroundColor` | string | `rgb(24 24 27)` | Background Color of the Messages Section | optional |

### Browser Support 🌍

Works in all modern browsers with Web Speech API support:

Chrome ✅ (best experience)

Edge ✅

Firefox ✅

Safari ⚠️ (partial support)

### License 📜
MIT © Abdullah Mukadam







