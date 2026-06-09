# 👟 Bata AI Assistant — Proof of Concept (POC) Report

## 1. Project Overview
**Topic:** Next-Gen Conversational Retail Assistant for Bata India.
**Goal:** To transform the traditional shoe-shopping experience into an interactive, personalized, and multi-lingual journey using state-of-the-art Generative AI.

---

## 2. The Solution
Bata AI Assistant is a web-based AI companion that acts as a "Digital Store Associate." It doesn't just list products; it understands **why** you need them, suggests matching accessories, and proactively offers discount-rich "Combo Deals."

### How it helps Bata (Business Value):
- **Increased AOV (Average Order Value):** By leading with Combo Deals (e.g., Office Starter Pack), it encourages customers to buy more than just one pair.
- **Market Reach (Bharat Focus):** With a native Hindi toggle and voice support, it caters to the next billion users who prefer vernacular interfaces.
- **Operational Efficiency:** The built-in Staff Dashboard and automated reporting help store managers track top-selling items and inventory health.

### How it helps Customers (User Value):
- **Decision Support:** Recommends shoes based on weather (e.g., breathable mesh for Gurgaon heat) and occasion.
- **Visual Discovery:** Users can upload a photo of a shoe they like, and the AI finds the closest Bata match.
- **Effortless Interaction:** Voice-to-text and Text-to-speech make it hands-free and accessible.

---

## 3. Technology Stack & Tools
| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite) |
| **Styling** | Vanilla CSS (Premium Glassmorphism Design) |
| **Core AI Engine** | Google Gemini 2.0/2.5 Flash (via API) |
| **Voice Interface** | Web Speech API (SpeechRecognition & SpeechSynthesis) |
| **Contextual Data** | OpenWeather API (simulated for location-based tips) |
| **Deployment/Dev** | Node.js, NPM, PowerShell |

---

## 4. Technical Architecture & Workflow

### A. The Data Layer (`products.js`)
- **Structure:** A JSON-like database of Shoes, Accessories, and Combo Deals.
- **Logic:** Includes helper functions like `filterProducts` and `getAccessoriesForProduct` to ensure the AI always stays within the actual stock.

### B. The Brain (`claudeApi.js` & `systemPrompt.js`)
- **System Prompt:** This is the "DNA" of the AI. It defines the female persona, strict catalog rules, and language protocols.
- **API Wrapper:** Handles rotation between multiple Gemini API keys to prevent rate-limiting and ensures 100% uptime during demos.
- **Custom Parser:** A robust regex-based parser that strips technical tags and extracts structured data (products, combos) to render them as beautiful UI cards.

### C. The Interface (`ChatWindow.jsx` & `MessageBubble.jsx`)
- **State Management:** Tracks language ('en' vs 'hi'), dark mode, and conversation history.
- **Message Rendering:** Dynamically chooses between text, product grids, accessory carousels, and combo banners based on AI output.

---

## 5. Main Functions & Logic
1.  **`doSend()`:** The core function that captures user input, adds context (weather/memory), and calls the AI.
2.  **`speakText()`:** Converts AI responses into a natural female voice. In Hindi, it uses "एआई" and "बाटा" for correct Indian pronunciation.
3.  **`parseClaudeResponse()`:** Cleans the AI's "inner thoughts" and ensures only professional, tag-free text reaches the user.
4.  **`handleFeedback()`:** Stores user ratings (thumbs up/down) in LocalStorage for future optimization.

---

## 6. Demo Scenarios (Mentor Presentation Guide)

### Scenario 1: The Corporate Professional (Men's Formal)
- **User Query:** "I need black formal shoes for my new office job in Gurgaon."
- **AI Action:** 
    1. Detects "Office" + "Gurgaon" (Weather context).
    2. Identifies **F001 (Executive Oxford)**.
    3. **Leads with the Deal:** Proactively shows **DEAL001 (Office Starter Pack)** which includes a belt and shoe bag with a **10% discount**.
    4. **Output:** Professional advice in English + 3 product cards + 1 combo banner.

### Scenario 2: The Busy Parent (Kids' Schooling)
- **User Query (Hindi):** "बच्चों के लिए स्कूल के मजबूत जूते दिखाओ।"
- **AI Action:**
    1. Detects "Hindi" mode + "Kids" category.
    2. Identifies **K001 (School Ace)** and **K003 (Kids Smart)**.
    3. **Feminine Persona:** Uses Hindi grammar like "Main aapki madad kar sakti hoon."
    4. **Lead with Deal:** Highlights **DEAL002 (Back to School Combo)** with socks at **15% off**.
    5. **Output:** Friendly Hindi response + Kids product grid + Combo card.

### Scenario 3: The Fitness Enthusiast (Men's Sports)
- **User Query:** "Looking for running shoes for my morning gym sessions."
- **AI Action:**
    1. Identifies **S001, S002, and S003** (varied sports shoes).
    2. **Upsell:** Suggests **DEAL004 (Marathon Pro Bundle)** with a **20% discount**.
    3. Highlights breathable materials for sweat resistance.

---

## 7. Future Scalability
- **Inventory Sync:** Link the `products.js` to a real-time SQL database.
- **AR Try-On:** Integrate camera-based foot measurement.
- **WhatsApp Integration:** Exporting recommendations directly to a customer's WhatsApp for offline follow-up.


