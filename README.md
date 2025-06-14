# Speak-Bich 🎙️

[![npm version](https://img.shields.io/npm/v/speak-bich)](https://www.npmjs.com/package/speak-bich)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/min/speak-bich)](https://bundlephobia.com/package/speak-bich)
[![Downloads](https://img.shields.io/npm/dm/speak-bich)](https://npm-stat.com/charts.html?package=speak-bich)

> Transform any web application into a voice-enabled experience with contextual AI assistance that sees and understands everything on your page.

## ✨ Features

- 🗣️ **Voice Recognition** - Convert speech to text with high accuracy
- 🔊 **Text-to-Speech** - Natural voice synthesis for AI responses  
- 🤖 **Gemini AI Integration** - Powered by Google's advanced language model
- 🧠 **Page Context Awareness** - AI understands your entire webpage content
- 🌐 **Cross-Browser Compatible** - Works seamlessly across all modern browsers
- ⚡ **Zero Dependencies** - Lightweight with no external libraries required
- 🎨 **Fully Customizable** - Adapt the UI to match your brand and design
- 🔌 **Flexible Integration** - Multiple implementation options for any project

## 🚀 Quick Start

### Installation

```bash
# npm
npm install speak-bich

# yarn
yarn add speak-bich

# pnpm
pnpm add speak-bich
```

### CDN Usage

```html
<script src="https://cdn.jsdelivr.net/npm/speak-bich@latest/dist/speak-bich.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/speak-bich@latest/dist/speak-bich.min.js"></script>
```

### Basic Implementation

```javascript
const assistant = new WebVoiceAssistant({
  geminiApiKey: "your-gemini-api-key-here"
});
```

That's it! Your voice assistant is now active on your page.

## 🔧 Configuration

### Complete Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `geminiApiKey` | `string` | **Required** | Your Gemini API key |
| `model` | `string` | `gemini-1.5-flash` | Gemini model version |
| `language` | `string` | `en-US` | Speech recognition language |
| `position` | `string` | `bottom-right` | Button position (`bottom-right` \| `bottom-left`) |
| `buttonSize` | `number` | 60 | Button size in pixels |
| `panelWidth` | `number` | 350 | Panel width in pixels |
| `panelHeight` | `number` | 450 | Panel height in pixels |
| `rate` | `number` | 0.9 | Speech synthesis speed (0.1-2.0) |
| `pitch` | `number` | 1 | Voice pitch (0-2.0) |
| `contextSize` | `number` | 5000 | Maximum context size in words |

For More Speech Recognition Languages check here : 
https://stackoverflow.com/questions/23733537/what-are-the-supported-languages-for-web-speech-api-in-html5

### Styling Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ButtonBackGroundColour` | `string` | `black` | Floating button background |
| `svgColor` | `string` | `white` | Icon color |
| `textColor` | `string` | `white` | Header text color |
| `headerTextName` | `string` | `Voice Asistant` | Header text Name |
| `PanelBackgroundColor` | `string` | `rgb(24 24 27)` | Panel background |
| `MessagesBackgroundColor` | `string` | `rgb(24 24 27)` | Messages background |

### Visual Guide

![Configuration Options Explained](https://res.cloudinary.com/dhbs6k3ue/image/upload/w_800,q_auto,f_auto/v1749883261/properties-explain_afd1hs.png)

### Advanced Configuration

```javascript
const assistant = new WebVoiceAssistant({
  geminiApiKey: "your-api-key",
  model: "gemini-1.5-pro",
  language: "en-US",
  position: "bottom-left",
  buttonSize: 70,
  panelWidth: 400,
  panelHeight: 500,
  rate: 1.1,
  pitch: 1.2,
  contextSize: 8000,
  ButtonBackGroundColour: "#2563eb",
  svgColor: "#ffffff",
  textColor: "#f8fafc",
  PanelBackgroundColor: "rgb(15 23 42)",
  MessagesBackgroundColor: "rgb(15 23 42)",
  headerTextName : "Asistant"
});
```

## 🛠️ Framework Integration

### React

```jsx
import { useEffect } from 'react';
import WebVoiceAssistant from 'speak-bich';

function VoiceAssistant() {
  useEffect(() => {
    const assistant = new WebVoiceAssistant({
      geminiApiKey: process.env.REACT_APP_GEMINI_KEY,
      position: 'bottom-left',
      buttonSize: 70
    });

    // Cleanup on unmount
    return () => {
      // Assistant cleanup if needed
    };
  }, []);

  return null;
}

export default VoiceAssistant;
```

### Next.js

```jsx
'use client';
import { useEffect } from 'react';
import WebVoiceAssistant from 'speak-bich';

export default function VoiceAssistant() {
  useEffect(() => {
    const assistant = new WebVoiceAssistant({
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_KEY,
      panelWidth: 400,
      position: 'bottom-right'
    });
  }, []);
  
  return null;
}
```

### Vue.js

```vue
<template>
  <div></div>
</template>

<script>
import WebVoiceAssistant from 'speak-bich';

export default {
  name: 'VoiceAssistant',
  mounted() {
    this.assistant = new WebVoiceAssistant({
      geminiApiKey: process.env.VUE_APP_GEMINI_KEY,
      language: 'en-US'
    });
  },
  beforeUnmount() {
    // Cleanup if needed
  }
}
</script>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Voice Assistant Demo</title>
</head>
<body>
    <h1>My Web Application</h1>
    
    <script src="https://unpkg.com/speak-bich@latest/dist/speak-bich.min.js"></script>
    <script>
        const assistant = new WebVoiceAssistant({
            geminiApiKey: "your-api-key-here",
            position: "bottom-right"
        });
    </script>
</body>
</html>
```

## 🌐 Browser Support

| Browser | Voice Recognition | Text-to-Speech | Overall Support |
|---------|-------------------|----------------|-----------------|
| Chrome | ✅ Full | ✅ Full | ✅ **Excellent** |
| Firefox | ✅ Full | ✅ Full | ✅ **Excellent** |
| Edge | ✅ Full | ✅ Full | ✅ **Excellent** |
| Safari | ⚠️ Limited | ✅ Full | ⚠️ **Good** |
| Mobile Chrome | ✅ Full | ✅ Full | ✅ **Excellent** |
| Mobile Safari | ⚠️ Limited | ✅ Full | ⚠️ **Good** |

> **Note**: Safari has limited Web Speech API support. Voice recognition may require user interaction to start.

## 🔑 Getting Your Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key and keep it secure
5. Add it to your environment variables or configuration

## 🐛 Troubleshooting

### Common Issues

**🎤 Microphone not working**
- Check browser permissions (click the microphone icon in address bar)
- Ensure HTTPS is enabled (required for microphone access)
- Test with a simple "Hello" command

**🔑 API errors**
- Verify your Gemini API key is correct and active
- Check your API usage limits in Google AI Studio
- Ensure your domain is authorized (if restrictions are set)

**🎨 UI not appearing**
- Check for CSS conflicts with your existing styles
- Verify no JavaScript errors in console
- Try different positioning options

**⚛️ SSR/Framework issues**
- Use dynamic imports in Next.js: `const WebVoiceAssistant = (await import('speak-bich')).default`
- Ensure component mounts on client-side only
- Check that Web Speech API is available: `'webkitSpeechRecognition' in window`



## 🤝 Contributing

We welcome contributions! 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Abdullah Mukadam](https://github.com/abdullahmukadam)

---

<div align="center">

Made with ❤️ by Abdullah Mukadam

</div>