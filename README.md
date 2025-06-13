# WebVoiceAssistant 🎙️

[![npm version](https://img.shields.io/npm/v/web-voice-assistant)](https://www.npmjs.com/package/web-voice-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/min/web-voice-assistant)](https://bundlephobia.com/package/web-voice-assistant)
[![Downloads](https://img.shields.io/npm/dm/web-voice-assistant)](https://npm-stat.com/charts.html?package=web-voice-assistant)

A lightweight voice assistant for web applications with AI response capabilities using the Web Speech API.

## Features ✨

- 🗣️ Speech recognition (voice-to-text)
- 🔊 Text-to-speech synthesis
- 🤖 Gemini AI integration
- 🌐 Cross-browser support
- ⚡ No dependencies
- 🎨 Fully customizable UI
- 🔌 Multiple integration options

## Installation 📦

```bash
npm install web-voice-assistant
# or 
yarn add web-voice-assistant
# or
pnpm add web-voice-assistant
```

For browser/CDN usage:

```html
<script src="https://cdn.jsdelivr.net/npm/web-voice-assistant@latest/dist/web-voice-assistant.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/web-voice-assistant"></script>
```

## Basic Usage

```javascript
const assistant = new WebVoiceAssistant({
  geminiApiKey: "your-api-key-here", // Required
  language: 'en-US',                // Optional
  position: "bottom-right",         // Optional
  buttonSize: 70,                   // Optional
  panelWidth: 400                   // Optional
});
```

## Complete Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `geminiApiKey` | string | - | Gemini API key (Required) |
| `model` | string | `gemini-1.5-flash` | Gemini model version |
| `language` | string | `en-US` | Speech recognition language |
| `position` | string | `bottom-right` | Button position |
| `buttonSize` | number | 60 | Button size in pixels |
| `panelWidth` | number | 350 | Panel width in pixels |
| `panelHeight` | number | 450 | Panel height in pixels |
| `rate` | number | 0.9 | Speech speed (0.1-2.0) |
| `pitch` | number | 1 | Voice pitch (0-2.0) |
| `contextSize` | number | 5000 | Context size in words |
| `ButtonBackGroundColour` | string | `black` | Button background color |
| `svgColor` | string | `white` | Icon color |
| `textColor` | string | `white` | Text color |
| `PanelBackgroundColor` | string | `rgb(24 24 27)` | Panel background |
| `MessagesBackgroundColor` | string | `rgb(24 24 27)` | Messages background |

## Framework Examples

### React Component

```jsx
import { useEffect } from 'react';
import WebVoiceAssistant from 'web-voice-assistant';

function VoiceAssistant() {
  useEffect(() => {
    const assistant = new WebVoiceAssistant({
      geminiApiKey: process.env.REACT_APP_GEMINI_KEY,
      position: 'bottom-left',
      buttonSize: 70
    });
    return () => assistant.destroy();
  }, []);

  return null;
}
```

### Next.js Component

```jsx
'use client';
import { useEffect } from 'react';
import WebVoiceAssistant from 'web-voice-assistant';

export default function VoiceAssistant() {
  useEffect(() => {
    const assistant = new WebVoiceAssistant({
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_KEY,
      panelWidth: 400
    });
    return () => assistant.destroy();
  }, []);
  
  return null;
}
```


## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Edge | ✅ Full |
| Safari | ⚠️ Partial |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ⚠️ Partial |

## Troubleshooting

- **Microphone not working**: Check browser permissions
- **API errors**: Verify your Gemini API key
- **UI not appearing**: Ensure no CSS conflicts
- **SSR issues**: Use dynamic imports in Next.js

## License

MIT © Abdullah Mukadam