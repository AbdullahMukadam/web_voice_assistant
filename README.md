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

```html
<script src="https://cdn.jsdelivr.net/npm/web-voice-assistant@latest/dist/web-voice-assistant.js"></script>
```

or

```html
<script src="https://unpkg.com/web-voice-assistant"></script>
```

## Usage

### NPM Usage

```javascript
const assistant = new WebVoiceAssistant({
    geminiApiKey: "",        // required
    language: 'en-US',       // optional: English by default
    contextSize: 5000,       // optional: context size in words
    position: "bottom-left", // optional: position of the panel
});
```

More properties available - check the configuration table below.

### CDN Usage (Browser) - Recommended

```html
<script>
    // Configure before loading your script
    window.__WEBVOICEASSISTANT_CONFIG__ = {
        geminiApiKey: ""
    };
</script>
<script src="https://cdn.jsdelivr.net/npm/web-voice-assistant@latest/dist/web-voice-assistant.js"></script>
```

After configuration, use it like this:

```javascript
const assistant = new WebVoiceAssistant({
    language: 'en-US',
    contextSize: 5000,
    position: "bottom-left",
});
```

## Configuration Options

| Option | Type | Default | Description | Required |
|--------|------|---------|-------------|----------|
| `geminiApiKey` | string | `undefined` | Gemini API key for AI responses | ✅ Required |
| `model` | string | `gemini-1.5-flash` | Gemini AI model to use | Optional |
| `maxTokens` | number | `200` | Maximum tokens for model response | Optional |
| `temperature` | number | `0.7` | Temperature for model creativity (0-1) | Optional |
| `language` | string | `'en-US'` | Speech recognition/synthesis language | Optional |
| `rate` | number | `0.9` | Speech speed (0.1-2.0) | Optional |
| `pitch` | number | `1` | Voice pitch (0-2.0) | Optional |
| `contextSize` | number | `5000` | Context size in number of words | Optional |
| `ButtonBackGroundColour` | string | `black` | Background color for floating button | Optional |
| `position` | string | `bottom-right` | Position of floating button (`bottom-left` or `bottom-right`) | Optional |
| `buttonSize` | number | `60` | Floating button size in pixels | Optional |
| `svgColor` | string | `white` | Color for robot SVG on floating button | Optional |
| `textColor` | string | `white` | Color for header text | Optional |
| `panelHeight` | number | `450` | Height of the panel in pixels | Optional |
| `panelWidth` | number | `350` | Width of the panel in pixels | Optional |
| `PanelBackgroundColor` | string | `rgb(24 24 27)` | Background color of the panel | Optional |
| `MessagesBackgroundColor` | string | `rgb(24 24 27)` | Background color of messages section | Optional |

## Browser Support 🌍

Works in all modern browsers with Web Speech API support:

- **Chrome** ✅ (best experience)
- **Edge** ✅
- **Firefox** ✅
- **Safari** ⚠️ (partial support)

## Example

```javascript
// Basic usage
const assistant = new WebVoiceAssistant({
    geminiApiKey: "your-api-key-here",
    language: 'en-US',
    position: "bottom-right"
});

// Advanced configuration
const assistant = new WebVoiceAssistant({
    geminiApiKey: "your-api-key-here",
    model: "gemini-1.5-flash",
    language: 'en-US',
    rate: 1.2,
    pitch: 1.1,
    contextSize: 3000,
    ButtonBackGroundColour: "#007bff",
    position: "bottom-left",
    buttonSize: 70,
    svgColor: "#ffffff",
    panelHeight: 500,
    panelWidth: 400
});
```

## License 📜

MIT © Abdullah Mukadam