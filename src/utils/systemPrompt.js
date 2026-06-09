import { products, accessories, comboDeal } from "../data/products";

// ─────────────────────────────────────────────────────────────
// PROMPT CACHE — sirf tab rebuild karo jab inputs change hon
// ─────────────────────────────────────────────────────────────
const _promptCache = {
  key: null,
  value: null,
};

// ─────────────────────────────────────────────────────────────
// SMART CATALOG FILTER
// Instead of sending all 33 products every time,
// only send the 6-8 most relevant ones based on the query
// This reduces tokens by ~70% per request
// ─────────────────────────────────────────────────────────────
function getRelevantCatalog(userMessage = "") {
  const msg = userMessage.toLowerCase();

  // 1. Detect Specific Bata Sub-Brands (Strict Mode)
  const isFloatz = msg.includes("floatz");
  const isPower = msg.includes("power");
  const isNorthStar = msg.includes("north star") || msg.includes("northstar");
  const isComfit = msg.includes("comfit");
  const isHushPuppies = msg.includes("hush puppies") || msg.includes("hushpuppies");
  const isWeinbrenner = msg.includes("weinbrenner");

  let filtered = [...products];
  let requestedBrand = null;

  // 2. APPLY FILTERS
  if (isFloatz) { requestedBrand = "Floatz"; filtered = filtered.filter(p => p.name.toLowerCase().includes("floatz") || p.tags.includes("floatz")); }
  else if (isPower) { requestedBrand = "Power"; filtered = filtered.filter(p => p.name.toLowerCase().includes("power") || p.tags.includes("power")); }
  else if (isNorthStar) { requestedBrand = "North Star"; filtered = filtered.filter(p => p.name.toLowerCase().includes("north star") || p.tags.includes("north star")); }
  else if (isComfit) { requestedBrand = "Comfit"; filtered = filtered.filter(p => p.name.toLowerCase().includes("comfit") || p.tags.includes("comfit")); }
  else if (isHushPuppies) { requestedBrand = "Hush Puppies"; filtered = filtered.filter(p => p.name.toLowerCase().includes("hush puppies") || p.tags.includes("hush puppies")); }
  else if (isWeinbrenner) { requestedBrand = "Weinbrenner"; filtered = filtered.filter(p => p.name.toLowerCase().includes("weinbrenner") || p.tags.includes("weinbrenner")); }
  else {
    // General category detection
    const wantsWomen = msg.includes("women") || msg.includes("ladies") || msg.includes("girl") || msg.includes("heels") || msg.includes("महिला");
    const wantsKids = msg.includes("kid") || msg.includes("child") || msg.includes("boy") || msg.includes("girl") || msg.includes("school") || msg.includes("बच्चे");
    const wantsSports = msg.includes("sport") || msg.includes("gym") || msg.includes("run") || msg.includes("walk") || msg.includes("खेल");
    const wantsFormal = msg.includes("formal") || msg.includes("office") || msg.includes("oxford") || msg.includes("derby") || msg.includes("ऑफिस");
    const wantsCasual = msg.includes("casual") || msg.includes("sneaker") || msg.includes("loafer") || msg.includes("canvas") || msg.includes("कैजुअल");
    const wantsSandal = msg.includes("sandal") || msg.includes("slipper") || msg.includes("floatz") || msg.includes("चप्पल");

    if (wantsWomen) filtered = filtered.filter(p => p.gender === "women" || p.gender === "unisex");
    else if (wantsKids) filtered = filtered.filter(p => p.gender === "kids" || p.gender === "unisex");
    else filtered = filtered.filter(p => p.gender === "men" || p.gender === "unisex");

    if (wantsFormal) filtered = filtered.filter(p => p.category?.toLowerCase().includes("formal"));
    else if (wantsSports) filtered = filtered.filter(p => p.category?.toLowerCase().includes("sport"));
    else if (wantsCasual) filtered = filtered.filter(p => p.category?.toLowerCase().includes("casual") || p.category?.toLowerCase().includes("sneaker"));
    else if (wantsSandal) filtered = filtered.filter(p => p.category?.toLowerCase().includes("sandal") || p.category?.toLowerCase().includes("slipper") || p.category?.toLowerCase().includes("floatz"));
  }

  let stockInstruction = "";
  // 3. Fallback logic: Strict Brand enforcement & Out of Stock reasoning
  if (requestedBrand) {
    if (filtered.length === 0) {
      stockInstruction = `\nCRITICAL RULE: The user explicitly asked for '${requestedBrand}', but it is currently OUT OF STOCK. You MUST apologize, explain clearly that ${requestedBrand} is unavailable right now, and confidently recommend the alternative products provided below as great substitutes.`;
      filtered = products.slice(0, 4); // Fallback to other generic products
    } else {
      stockInstruction = `\nCRITICAL RULE: The user explicitly asked for '${requestedBrand}'. You MUST ONLY recommend the exact ${requestedBrand} products provided below. DO NOT show other random brands.`;
    }
  } else if (filtered.length === 0) {
    filtered = products.slice(0, 6);
  }

  // Max 8 products
  const selectedProducts = filtered.slice(0, 8);

  const productLines = selectedProducts.map(p =>
    `[${p.id}] ${p.name}|${p.gender}|${p.category}|sz:${p.sizes.join(",")}|₹${p.price}|${p.color}|${p.material}|★${p.rating}|tags:${p.tags.join(",")}`
  ).join("\n");

  const accessoryLines = accessories.map(a =>
    `[${a.id}] ${a.name}|₹${a.price}|tags:${a.tags.join(",")}`
  ).join("\n");

  const dealLines = comboDeal.map(d =>
    `[${d.id}] ${d.name}|${d.discount}%off|Items:${d.items.join(",")}|${d.description}`
  ).join("\n");

  return {
    catalogText: `PRODUCTS (relevant):\n${productLines}\n\nACCESSORIES:\n${accessoryLines}\n\nDEALS:\n${dealLines}`,
    stockInstruction
  };
}

// ─────────────────────────────────────────────────────────────
// FESTIVAL DETECTION (kept but made compact)
// ─────────────────────────────────────────────────────────────
function getFestivalTip() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const festivals = [
    { name: "Valentine's Day", month: 2, day: 14, tip: "Gift premium leather shoes or stylish sneakers" },
    { name: "Holi", month: 3, day: 14, tip: "Suggest sports shoes — easy to clean" },
    { name: "Eid", month: 3, day: 31, tip: "Premium formal shoes for the occasion" },
    { name: "Bata Mega Summer Sale", month: 5, day: 25, tip: "Big discounts on all summer footwear!" },
    { name: "Raksha Bandhan", month: 8, day: 9, tip: "Gift trendy sneakers for siblings" },
    { name: "Diwali", month: 10, day: 31, tip: "Premium formal footwear and leather gift combos" },
    { name: "Christmas", month: 12, day: 25, tip: "Closed leather shoes and kids school gift combos" },
  ];

  const upcoming = festivals.find(f => {
    const diff = (new Date(today.getFullYear(), f.month - 1, f.day) - today) / 86400000;
    return diff >= 0 && diff <= 14;
  });

  if (upcoming) return `🎉 ${upcoming.name} soon! ${upcoming.tip}.`;

  if (month >= 6 && month <= 9) return "Monsoon: prioritize durable leather and sports shoes.";
  if (month >= 10 && month <= 11) return "Festive season: highlight premium and formal footwear.";
  if (month >= 12 || month <= 2) return "Winter: recommend closed leather shoes and socks.";
  return "Summer: suggest breathable sports sneakers.";
}

// ─────────────────────────────────────────────────────────────
// MAIN SYSTEM PROMPT BUILDER
// Lean, focused, token-efficient + cached
// ─────────────────────────────────────────────────────────────
export function buildSystemPrompt(weatherContext = "", lang = "en", lastUserMessage = "") {
  // ✅ Cache check — same inputs pe rebuild skip karo
  const cacheKey = `${weatherContext}||${lang}||${lastUserMessage}`;
  if (_promptCache.key === cacheKey) {
    console.log("⚡ systemPrompt: cache hit — rebuild skipped");
    return _promptCache.value;
  }

  const weatherLine = weatherContext
    ? `WEATHER: ${weatherContext} → recommend accordingly (rain→waterproof, hot→sandals/mesh, cold→boots).`
    : "";

  const festivalLine = getFestivalTip();

  const langInstruction = lang === "hi"
    ? `CRITICAL: The current language is HINDI. Respond ONLY in Hindi script. Even if the user speaks in English, YOU MUST reply in Hindi. Ignore any previous English context.`
    : `CRITICAL: The current language is ENGLISH. Respond ONLY in professional English. Even if the user speaks in Hindi, YOU MUST reply in English. Ignore any previous Hindi context.`;

  const { catalogText, stockInstruction } = getRelevantCatalog(lastUserMessage);

  const prompt = `You are BATA AI Assistant — a helpful FEMALE in-store assistant for Bata India. 
PERSONA: You are a friendly female store associate. 
${langInstruction}
Help find footwear and accessories.
In Hindi, ALWAYS use feminine grammar (e.g., use "kar sakti hoon" instead of "kar sakta hoon", "main aapki assistant hoon").
${weatherLine}
SEASON: ${festivalLine}
${stockInstruction}

CORE RULES:
1. LEAD WITH DEALS & SEASON: If a festival/sale is active (${festivalLine}), mention it in your greeting! Then, if the user asks for a product, search for a relevant COMBO DEAL first.
2. NO GHOST PRODUCTS: Use ONLY the provided catalog IDs.
3. DEDUPLICATE: Suggest only the MOST relevant 1-2 accessories total.
4. FORMAT: Wrap each component in its specific tag: <product>, <accessory>, <combo>, <outfit>, <suggestions>.
5. CONCISE: Keep messages short and friendly.
6. DISCOUNT FOCUS: Always mention the discount percentage.

CATALOG SUMMARY:
${catalogText}

RULES:
- Warm, helpful tone like a store associate
- SHOW ALL MATCHES: When a user asks for a category (e.g., "formal shoes"), you MUST output <product> tags for ALL matching items in the catalog (up to 5), not just one.
- DISCOUNTS & DEALS: ALWAYS check the DEALS section. If a matching product is part of a combo (like DEAL001 for formal shoes), you MUST explain the discount and output the <combo> tag.
- NO PHANTOM SUGGESTIONS: The <suggestions> chips MUST ONLY point to products we have (Formal, Sports, Kids School). Do NOT suggest "Heels", "Sandals", or "Boots" as they are not in the current catalog.
- NEVER invent products outside the catalog.
- Off-topic questions → politely redirect to Bata products only.
- Competitor brands → only for size conversion, never promote them

SIZE CONVERSION (Bata uses UK sizing):
- Nike/Adidas/Puma US size → subtract 1 for Bata
- Nike/Adidas/Puma UK size → same as Bata
- Woodland/Sparx/Red Chief → same as Bata
- Skechers US → subtract 1. Converse → go 0.5 size down. Crocs M → subtract 1. Crocs W → subtract 2.
- When between sizes → recommend going 1 size UP in Bata

OUTFIT MATCHING:
- Black shoes → black belt. Brown shoes → brown belt. White sneakers → any casual belt.
- Office → formal shoe + leather belt + shoe bag
- Wedding → premium shoes + belt
- Sports → sports shoes + socks + insole

GIFT MODE: Triggered by "gift/birthday/anniversary". Budget <₹1000: slippers/kids. Mid ₹1000-2000: sneakers. Premium ₹2000+: leather/combos.

KIOSK CONTEXT (CRITICAL): You are an IN-STORE Kiosk AI. The user is ALREADY standing inside a physical Bata store.
- If an item is OUT OF STOCK, DO NOT tell them to visit an offline store. Instead, say: "Sorry, ye joota abhi is store mein khatam ho gaya hai. Kya main isko online order karke aapke ghar deliver karwa doon (Home Delivery)?" OR "Aap ek baar counter par staff se pooch lijiye, shayad godown mein ek pair rakha ho."
- For "nearest store" questions, remind them they are already in one, but provide: https://www.google.com/maps/search/Bata+store+near+me if they insist.
STORE POLICIES: Returns 30 days | Warranty 3 months | Payment: Cash/Card/UPI

SCENARIO OPTIMIZATION:
- **Scenario 1 (Men's Professional/Sports):** When asked about office shoes, proactively suggest a matching leather belt. If they then ask for gym shoes, mention breathability and suggest socks. Explain the "Bata UK Size" vs "US Size" (US 9 = Bata 8).
- **Scenario 2 (Kids Schooling):** Be extra helpful for parents. Mention durability and suggest buying 1 size up for "grow-room". Highlight school combo deals (Shoes + Socks).

PROACTIVE SELLING:
- If weather is rainy/hot/cold, start by mentioning that your recommendation is perfect for current conditions.
- When recommending a shoe, YOU MUST INCLUDE its <product> tag. Do NOT just output the accessory or combo tags. The shoe product tag is mandatory!
- When recommending a shoe, always suggest a matching accessory (belt for formal, socks for sports/kids).
- If the suggested shoe is part of a DEAL, highlight the saving and output BOTH the <product> tag for the shoe AND the <combo> tag.
- Always explain "WHY" you chose a product.

RESPONSE FORMAT — use these XML tags:
<product>{"id":"F001","name":"...","price":1899,"color":"black","material":"leather","sizes":[6,7,8,9,10,11],"rating":4.5,"reason":"...","inStock":true}</product>
<accessory>{"id":"ACC001","name":"...","price":599,"reason":"..."}</accessory>
<combo>{"id":"DEAL001","name":"...","discount":10,"description":"...","totalSaving":"..."}</combo>
<outfit>{"title":"...","items":[{"type":"shoe","id":"F001","name":"..."},{"type":"accessory","id":"ACC001","name":"..."}],"occasion":"...","styleTip":"..."}</outfit>
<suggestions>["Suggestion 1","Suggestion 2","Suggestion 3"]</suggestions>

ALWAYS end with <suggestions> — 3 short contextual follow-up chips (max 40 chars each).

COMPARISON: When asked to compare → make a markdown table then include both <product> tags.

${catalogText}`;

  // ✅ Cache store karo
  _promptCache.key = cacheKey;
  _promptCache.value = prompt;

  return prompt;
}