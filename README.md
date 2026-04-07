<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg" alt="Logo" width="80" height="80">
  <h1 align="center">Codebase Explainer AI</h1>
  
  <p align="center">
    An interactive, AI-powered web application that demystifies GitHub repositories by generating live architectural diagrams, comprehensive code explanations, and providing an embedded repository chatbot.
    <br />
    <br />
    <a href="https://code-base-explainer.vercel.app/"><strong>✨ View Live Site ✨</strong></a>
    ·
    <a href="https://github.com/Raphel6969/codebase-explainer/issues">Report Bug</a>
    ·
    <a href="https://github.com/Raphel6969/codebase-explainer/issues">Request Feature</a>
  </p>
</div>

---

## 🌟 About The Project

Diving into a brand-new, complex codebase can be utterly overwhelming. **Codebase Explainer AI** is built to bridge the gap between human readers and dense logic. Simply paste in a GitHub repository URL, and the app will instantly render the filesystem. 

By clicking on any file, the Gemini AI engine kicks in to provide deep insights: it structures the raw code logic into Beginner, Developer, and Pseudocode scopes, renders beautiful logic flow architectures via Mermaid.js, and even offers a persistent AI chatbot to answer whatever specific architectural questions you have about the module.

### 🎨 Key Features

| Feature | Description |
| ------- | ----------- |
| 🗂 **Interactive Explorer** | Browse remote GitHub repositories instantly without `git clone`. |
| 🤖 **Multi-Tiered AI Explanations** | Toggle between **Beginner**, **Developer**, and **Pseudocode** insights generated live by Google's Gemini Flash AI. |
| 📊 **Logic Flow Visualizations** | The AI reads your raw file code and generates scalable **Mermaid.js architectural diagrams** visualizing class states and control flows. |
| 💬 **Contextual Repo Chat** | Ask questions directly to the chatbot. It natively retains the precise scope of the code file you're currently inspecting. |
| 🛡 **Smart Rate Limiting** | Custom Node.js API pipelines engineered to cleanly proxy and sanitize GitHub REST trees and Markdown. |
| 🌗 **State-of-the-art UI** | Sleek, glassmorphic dark-mode interface built uniquely using modern TailwindCSS tokens. |

---

## 🛠 Built With

* **[Next.js (App Router)](https://nextjs.org/)** - Full Stack React framework
* **[React 19](https://react.dev/)** - Component GUI and states
* **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first styling framework
* **[Framer Motion](https://www.framer.com/motion/)** - Smooth and complex UX interaction animations
* **[Mermaid.js](https://mermaid.js.org/)** - Diagramming and charting tool that renders Markdown-inspired text definitions dynamically
* **[Google Gemini AI](https://deepmind.google/technologies/gemini/)** - `@google/genai` intelligent analysis models processing large context windows natively.
* **[Prism.js](https://prismjs.com/)** - Lightweight syntax highlighting component engine

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Node.js installed on your local machine.

### Installation

1. **Get a free Google Gemini API Key** at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Get a free GitHub Personal Access Token** at [GitHub Developer Settings](https://github.com/settings/tokens) (Used to bypass the 60 requests/hr rate limits)
3. **Clone the repository**
   ```bash
   git clone https://github.com/Raphel6969/codebase-explainer.git
   ```
4. **Install NPM packages**
   ```bash
   cd codebase-explainer
   npm install
   ```
5. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GITHUB_TOKEN=your_github_classic_token_here
   ```
6. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 🔮 Upcoming Features (Roadmap)

We are constantly looking to expand the usability and context-awareness of the pipeline!

- [ ] **Repository Setup Auto-Analyzer:** Scans `package.json`, `go.mod`, or `requirements.txt` to automatically deduce and generate 1-click terminal setup guides.
- [ ] **Repo-Wide Search:** Global vector-search allowing users to find functions and logic by typing out what they do in plain English.
- [ ] **Export to PDF/Markdown:** Locally download the generated Mermaid logic flows and AI codebase explanations straight to `.md` files to put in your own local repository docs.
- [ ] **Resizable Layout Upgrade:** Completed ✅ (Thanks to `react-resizable-panels` integration!)

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🔐 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>🌟 If you like this project, please consider leaving a star on GitHub! 🌟</b>
</div>
