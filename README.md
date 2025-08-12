# ✨ Wobbly Wonders - Your Personal Space

> A beautiful, empathetic journaling application that creates a safe space for your thoughts and reflections.
> 
> Completely private, runs entirely in your browser, with an optional local AI companion that truly cares and
> is there to help you along on your (often wobbly but always wonderful) journey.

[![Views](https://hits.sh/github.com/moonlight-sanctuary/Wobbly-Wonder-Journal.svg?label=Views&color=brightgreen&style=flat-square)](https://hits.sh/github.com/moonlight-sanctuary/Wobbly-Wonder-Journal)

If you enjoyed using this app, please drop a star on the repo. I made it super private (i.e. there are no external integrations, sign-ins, not even any http requests that go out from the app). If you like it, drop a star so I can see. Or hit the button above. Or both?

## 🌟 Why Wobbly Wonders?

**Wobbly Wonders** isn't just another note-taking app. Its simple and tailor made to not be distracting, to be pleasant looking, and to just work. Whether you're processing daily experiences, exploring your emotions, or celebrating your wins, Wobbly Wonders provides a warm, supportive environment that encourages honest, self-expression and gives you your own space. Use it on any device, anywhere with or without an internet connection. 

### ✨ **What Makes Wobbly Wonders Special**

- 🔒 **Complete Privacy** - Your thoughts stay on your device, never shared or tracked ( I cannot emphasise enough that don't want your data, my data is already too much for me to organize ¯\_(ツ)_/¯ )
- 🤗 **Empathetic AI Companion** - An AI that responds with genuine care, validation, and support
- 🎨 **Beautiful Themes** - Warm, cool, and minimal themes that adapt to your mood with light and dark mode
- 🚀 **Zero Setup** - Open and start writing immediately, no accounts or configuration

## 🚀 Quick Start

1. **Visit `[the hosted app](https://moonlight-sanctuary.github.io/Wobbly-Wonder-Journal/)`** or download this package and open `index.html` in any modern browser
2. **Start writing immediately** - no setup
3. **Your thoughts auto-save** as you type into your browser
4. **Export and backup your work** so you can keep your thoughts to yourself while keeping them safe
5. **Explore AI features** (optional) for deeper insights. Scroll down for setup details. Or don't, you don't need to if you don't want to. 

## ✨ Core Features

### 📝 **Distraction-Free Writing**
- **Clean, focused interface** that gets out of your way
- **Auto-save every second** - never lose a thought
- **Real-time word count** to track your progress
- **Smooth, responsive typing** experience

### 🤖 **Empathetic AI Companion** *(Optional)*
- **Growth-focused insights** that celebrate your journey
- **Supportive summaries** that highlight your strength and resilience
- **Multiple AI models** - choose what works best for you
- **100% local processing** - your data never leaves your device

### 🎨 **Beautiful, Simple Themes**
- **Warm Theme** 🔥 - Cozy and inviting for comfortable reflection
- **Cool Theme** ❄️ - Professional and calming for focused writing
- **Minimal Theme** ⚪ - Clean and distraction-free for pure thoughts
- **Dark/Light modes** for any time of day
- **Seamless theme switching** that adapts instantly

### 💾 **Your Data, Your Control**
- **100% local storage** - everything stays on your device
- **Export/Import** your entire journal as JSON
- **No accounts, no tracking, no external servers**
- **Works offline** - write anywhere, anytime

### 📱 **Works Everywhere**
- **Responsive design** - perfect on desktop, tablet, and mobile
- **Touch-friendly** interface for mobile journaling
- **Keyboard shortcuts** for power users
- **Fast loading** - optimized for any device

## 🤖 AI Features Deep Dive

### **Empathetic AI Models**

### **AI Capabilities** powered by [Ollama](https://ollama.com/)
- **Entry Summaries** - Warm, supportive reflections on your writing
- **Chat Companion** - Ask questions about your journal and get caring insights
- **Overall Journey Analysis** - Celebrate your growth and patterns over time
- **Automatic Model Management** - Downloads and manages AI models for you

Choose from multiple [AI models](https://ollama.com/search) based on your preferences. Try them each out:
- **Qwen3 Series** - Latest models with excellent reasoning
- **Gemma3 Series** - Google's efficient, high-quality models  
- **DeepSeek-R1** - Deepseek thinking models with detailed reasoning chains
- **Llama Series 3 and 2** - Meta's reliable, lightweight models
- **OpenAI OSS models** - OpenAI's Open Source models
 
## 🎨 Theme System

### **Warm Theme** 🔥
Perfect for cozy evening reflections, processing emotions, or when you need comfort.
- Rich oranges and warm tones
- Inviting and nurturing atmosphere
- Great for emotional processing

### **Cool Theme** ❄️  
Ideal for morning pages, goal setting, or analytical thinking.
- Calming blues and professional tones
- Clear and focused environment
- Perfect for structured thinking

### **Minimal Theme** ⚪
Best for distraction-free writing, meditation, or when you want pure simplicity.
- Clean grays and whites
- Minimal visual elements
- Ultimate focus on your words

Each theme automatically supports light and dark modes, ensuring comfort at any time of day.

## 📱 How to Use Wobbly Wonders locally

### **Getting Started**
1. Open `index.html` in any modern browser
2. Start typing immediately - no setup needed
3. Your entry auto-saves as you write just like on the web version

### **AI Companion Setup** *(Optional)*
1. Install [Ollama](https://ollama.ai) on your computer and confirm its running by visiting https://localhost:11434 
2. Choose your preferred AI model from the settings
3. The app will automatically download and integrate with the selected model for local use
4. Start chatting with your empathetic AI companion. Your chat is saved nowhere, goes nowhere, and is only your space (like the rest of the app).

## 🔒 Privacy & Security

**Your privacy is sacred.** Wobbly Wonders is designed with privacy-first principles:

- **Local-only storage** - All data stays in your browser. Don't clear your browser cache without exporting!
- **No external servers** - No data ever leaves your device, don't forget to back up your journal!
- **No tracking or analytics** - We don't know what you write
- **No accounts required** - Start writing immediately
- **AI processing** - All AI features run locally on your device
- **Export control** - You own and control all your data. Export and import at your pleasure.

## 🛠️ Technical Details

### **Architecture**
```
├── index.html          # Main application
├── style.css           # Beautiful, theme-aware styles  
├── app.js              # Full application logic
└── test-framework.js   # Comprehensive testing
```

### **Personal Use**
- **Local use** - Download the repo and just open `index.html` in your browser. It just works.
- **Deploy your own instance** by taking the app.js, index.html, and the styles.css to any static hosting provider (ex: Github Pages/Netlify/Vercel/Hostinger)

### **Offline Use**
Wobbly Wonders works completely offline once loaded - perfect for:
- ✈️ Travel journaling
- 🏕️ Remote locations
- 🔒 Maximum privacy
- 📱 Mobile-only setups

## 🧪 Quality & Testing

Wobbly Wonders includes a comprehensive test suite with 40+ automated tests covering:

- ✅ **Core functionality** - Writing, saving, loading entries
- ✅ **AI features** - Model management, summaries, chat
- ✅ **UI interactions** - Sidebars, themes, responsive design
- ✅ **Data integrity** - Export/import, search, entry management
- ✅ **Error handling** - Graceful failures and recovery
- ✅ **Cross-device compatibility** - Desktop, tablet, mobile

## 📄 License

MIT License - Use freely, modify as needed, share the love! ❤️

---

*Made for me because I couldn't find a simple app out there, shared with ❤️ for everyone who believes in the power of reflection and personal growth.*
