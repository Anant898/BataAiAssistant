import { buildSystemPrompt } from "./systemPrompt";
import { products, accessories, comboDeal } from "../data/products";

const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_API_KEY_5,
].filter(Boolean);

let currentKeyIndex = 0;
function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

const MODELS = [
  "gemini-2.5-flash",        // Best — latest, highest free quota
  "gemini-2.0-flash",        // Very reliable
  "gemini-2.0-flash-lite",   // Lightest — almost never rate limited
  "gemini-flash-latest",     // Auto-picks best available flash model
];

// ✅ Bug #5 Fix — Image support check
const IMAGE_SUPPORTED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

const getModelsForRequest = (hasImage) => {
  if (!hasImage) return MODELS;
  return MODELS.filter(m => IMAGE_SUPPORTED_MODELS.includes(m));
};

// ✅ Issue #7 Fix — Important context extract karo full history se
function extractMemory(chatHistory) {
  const lines = chatHistory.map(m => m.content).join(" ").toLowerCase();

  const size = lines.match(/size\s*(\d+)/)?.[1];
  const budget = lines.match(/₹\s*(\d+)|budget\s*(\d+)/)?.[1];
  const gender = lines.includes("women") || lines.includes("ladies") ? "women"
    : lines.includes("kid") || lines.includes("child") ? "kids"
      : lines.includes("men") ? "men" : null;
  const occasion = lines.includes("office") ? "office"
    : lines.includes("wedding") ? "wedding"
      : lines.includes("sport") || lines.includes("gym") ? "sports"
        : null;

  const parts = [];
  if (size) parts.push(`size: UK${size}`);
  if (budget) parts.push(`budget: ₹${budget}`);
  if (gender) parts.push(`gender: ${gender}`);
  if (occasion) parts.push(`occasion: ${occasion}`);

  return parts.length > 0
    ? `[User context: ${parts.join(", ")}]`
    : "";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMessage(chatHistory, weatherContext = "", lang = "en", imageData = null) {
  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === "user")?.content || "";
  const systemPrompt = buildSystemPrompt(weatherContext, lang, lastUserMsg);

  // ✅ Issue #7 Fix — Memory extract karo poori history se
  const memory = extractMemory(chatHistory);
  const systemPromptWithMemory = memory
    ? `${systemPrompt}\n\nMEMORY: ${memory}`
    : systemPrompt;

  const contents = [];

  // ✅ Issue #7 Fix — systemPromptWithMemory use karo, systemPrompt nahi
  contents.push({
    role: "user",
    parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPromptWithMemory}\n\nReply "Understood." to confirm.` }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I am BATA AI Assistant, ready to help." }],
  });

  // ✅ Issue #7 Fix — Last 6 → Last 4 (token saving ~33%)
  const recentHistory = chatHistory.slice(-4);

  for (let i = 0; i < recentHistory.length; i++) {
    const msg = recentHistory[i];
    const isLast = i === recentHistory.length - 1;
    const role = msg.role === "assistant" ? "model" : "user";

    if (isLast && role === "user" && imageData) {
      contents.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: imageData.mimeType, data: imageData.base64 } },
          { text: msg.content || "Identify this shoe and find closest Bata catalog matches." },
        ],
      });
    } else {
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }

  let lastError = null;

  // ✅ Bug #5 Fix — Image-safe model selection
  const modelsToTry = getModelsForRequest(!!imageData);
  for (const model of modelsToTry) {
    for (let keyAttempt = 0; keyAttempt < API_KEYS.length; keyAttempt++) {
      const apiKey = getNextKey();

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          const errMsg = err?.error?.message || "API error";
          const isRateLimit =
            errMsg.toLowerCase().includes("quota") ||
            errMsg.toLowerCase().includes("exhausted") ||
            errMsg.toLowerCase().includes("overload") ||
            errMsg.toLowerCase().includes("demand") ||
            errMsg.toLowerCase().includes("not found") ||
            response.status === 429 ||
            response.status === 503;

          if (isRateLimit) {
            lastError = new Error(`${model} key${keyAttempt + 1}: ${errMsg}`);
            console.warn(`⚠️ ${model} (key ${keyAttempt + 1}/${API_KEYS.length}) busy — trying next...`);
            await wait(500);
            continue;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from model");

        console.log(`✅ ${model} (key ${keyAttempt + 1}) responded`);
        return text;

      } catch (err) {
        lastError = err;
        console.warn(`${model} (key ${keyAttempt + 1}) failed:`, err.message);
        await wait(500);
      }
    }
  }

  // ✅ Bug #5 Fix — Clear error agar image models bhi fail
  if (imageData && modelsToTry.length === 0) {
    throw new Error("Image search is not supported right now. Please describe the shoe instead.");
  }

  throw new Error("All Gemini models are busy. Please try again in a moment.");
}

export function parseClaudeResponse(rawText) {
  const result = {
    message: "",
    products: [],
    accessories: [],
    combo: null,
    outfit: null,
    suggestions: [],
  };

  const normalized = rawText.replace(
    /<(product|accessory|combo|outfit|suggestions)>([\s\S]*?)<\/\1>/gi,
    (_, tag, content) => `<${tag.toLowerCase()}>${content.replace(/\s+/g, " ").trim()}</${tag.toLowerCase()}>`
  );

  const productMatches = [...normalized.matchAll(/<product>([\s\S]*?)<\/product>/gi)];
  for (const match of productMatches) {
    try { 
      let cleanStr = match[1].trim().replace(/^```(?:json)?|```$/gi, "").trim();
      const p = JSON.parse(cleanStr);
      const local = products.find(x => x.id === p.id);
      if (local) {
        p.image = local.image; // ✅ Zero token image injection
        if (!p.category) p.category = local.category;
      }
      result.products.push(p); 
    }
    catch (err) { console.warn("Could not parse product:", match[1], err); }
  }

  const accessoryMatches = [...normalized.matchAll(/<accessory>([\s\S]*?)<\/accessory>/gi)];
  for (const match of accessoryMatches) {
    try { 
      let cleanStr = match[1].trim().replace(/^```(?:json)?|```$/gi, "").trim();
      const a = JSON.parse(cleanStr);
      const local = accessories.find(x => x.id === a.id);
      if (local) {
        a.image = local.image; // ✅ Zero token image injection
      }
      result.accessories.push(a); 
    }
    catch (err) { console.warn("Could not parse accessory:", match[1], err); }
  }

  const comboMatch = normalized.match(/<combo>([\s\S]*?)<\/combo>/);
  if (comboMatch) {
    try { 
      const c = JSON.parse(comboMatch[1].trim());
      const local = comboDeal.find(x => x.id === c.id);
      if (local) {
        c.image = local.image; // ✅ Zero token image injection
      }
      result.combo = c; 
    }
    catch { console.warn("Could not parse combo:", comboMatch[1]); }
  }

  const outfitMatch = normalized.match(/<outfit>([\s\S]*?)<\/outfit>/);
  if (outfitMatch) {
    try { 
      const o = JSON.parse(outfitMatch[1].trim());
      // Inject images for outfit items
      if (o.items) {
        o.items.forEach(item => {
          const local = products.find(x => x.id === item.id) || accessories.find(x => x.id === item.id);
          if (local) item.image = local.image;
        });
      }
      result.outfit = o; 
    }
    catch { console.warn("Could not parse outfit:", outfitMatch[1]); }
  }

  const suggestionsMatch = normalized.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
  if (suggestionsMatch) {
    try {
      const parsed = JSON.parse(suggestionsMatch[1].trim());
      if (Array.isArray(parsed)) {
        result.suggestions = parsed
          .slice(0, 5)
          .map(s => s.length > 40 ? s.slice(0, 37) + '...' : s);
      }
    } catch { console.warn("Could not parse suggestions:", suggestionsMatch[1]); }
  }

  result.message = rawText
    .replace(/<product>[\s\S]*?<\/product>/gi, "")
    .replace(/<accessory>[\s\S]*?<\/accessory>/gi, "")
    .replace(/<combo>[\s\S]*?<\/combo>/gi, "")
    .replace(/<outfit>[\s\S]*?<\/outfit>/gi, "")
    .replace(/<suggestions>[\s\S]*?<\/suggestions>/gi, "")
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/gi, "")
    .replace(/<[^>]+>/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")  // Collapse 3+ newlines to just 2
    .trim();

  return result;
}