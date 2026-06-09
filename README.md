# 👟 Bata AI Assistant — In-Store Digital Associate

An intelligent, location-gated conversational retail assistant built for **Bata India**. It transforms traditional shoe shopping into an interactive, personalized, and multilingual journey using state-of-the-art Generative AI.

---

## 🌟 Key Features

### 📍 1. In-Store Geo-Gated Access (`StoreGuard`)
* Restricted to the physical perimeter of the **Bata Connaught Place store, New Delhi** (100-meter radius).
* Checks real-time GPS location via the Web Geolocation API.
* **Developer Override:** Tap the Bata logo 5 times to bypass location restriction.

### 🔑 2. Resilient API Engine with Key Rotation (`claudeApi.js`)
* Dynamically rotates between up to 5 Gemini API keys to bypass rate limits during live demonstrations.
* Auto-selects and falls back across models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-flash-latest`).
* Image-safe search routing (only routes query to image-supported models if a shoe image is uploaded).

### 💡 3. Deep Memory & Context-Aware AI
* **User Memory Extraction:** Parses chat history to remember user preferences (e.g., Shoe Size, Budget, Gender, Occasion).
* **Weather Integration:** Connects with the OpenWeather API (simulated for CP location) to recommend products based on temperature and climate (e.g., lightweight, breathable mesh shoes for hot summer days).

### 📈 4. AOV Booster (Combo Deals & Upsells)
* Recommends matching accessories based on selected shoes.
* Proactively highlights combo deals (e.g., *Office Starter Pack* or *Back to School Combo*) to increase Average Order Value (AOV).

### 🎙️ 5. Multilingual Voice Interface
* Built-in Hindi & English support with standard toggle.
* Text-to-Speech (TTS) and Speech-to-Text (STT) using Web Speech API.
* Optimized pronunciation for Indian vernacular contexts.

### 📊 6. Staff Dashboard & Analytics
* Secure PIN-protected dashboard for store managers (`VITE_STAFF_PIN`).
* Displays user feedback ratings (thumbs up/down).
* Analytics on top-selling items and inventory status.

---

## 📁 Project Structure

```bash
bataCopilot/
├── public/                 # Static assets (product images, icons)
├── src/
│   ├── assets/             # Global image assets
│   ├── components/
│   │   ├── StoreGuard.jsx  # Geolocation gatekeeper
│   │   ├── ChatWindow.jsx  # Main conversational container
│   │   ├── MessageBubble.jsx # Individual chat messages with dynamic components
│   │   ├── ProductCard.jsx   # Shoppable product card
│   │   ├── OutfitCard.jsx    # Complete outfit visualization
│   │   ├── StaffMode.jsx     # Staff dashboard access & views
│   │   └── Dashboard.jsx     # Sales & feedback analytics graphs
│   ├── data/
│   │   └── products.js     # Shoes, Accessories, and Combo database catalog
│   ├── utils/
│   │   ├── claudeApi.js    # Gemini API wrapper with key rotation & parser
│   │   ├── systemPrompt.js # Prompt engineering and assistant behavior rules
│   │   ├── weatherApi.js   # OpenWeather integration
│   │   └── analytics.js   # LocalStorage-backed analytics helper
│   ├── App.jsx             # Root layout wrapper
│   ├── main.jsx            # React mounting entry point
│   └── index.css           # Premium Glassmorphism UI Stylesheet
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules (protects credentials)
├── package.json            # Node project configuration
└── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 🛠️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anant898/bataCopilot.git
   cd bataCopilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Duplicate `.env.example` and rename it to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Open `.env` and fill in your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     VITE_OPENWEATHER_API_KEY=your_weather_key_here
     VITE_STAFF_PIN=1234
     ```

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   * Open the URL shown in terminal (usually `http://localhost:5173`) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔒 Security Note
The `.env` file is excluded from git tracking in `.gitignore` to prevent leakage of credentials. Never commit your API keys to public repositories.

---
*Developed for Bata India Proof of Concept (POC).*
