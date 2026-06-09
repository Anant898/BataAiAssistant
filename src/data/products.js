export const products = [
  // ── MEN'S FORMAL ───────────────────────────────────────────
  {
    id: "F001",
    name: "Bata Executive Oxford",
    category: "formal",
    gender: "men",
    sizes: [6, 7, 8, 9, 10, 11],
    price: 1899,
    color: "black",
    material: "genuine leather",
    rating: 4.8,
    inStock: true,
    image: "/images/men_formal_oxford.png",
    combos: ["ACC001", "ACC003", "ACC005"],
    tags: ["formal", "office", "leather", "oxford", "premium", "men"],
  },
  {
    id: "F002",
    name: "Bata Derby Classic",
    category: "formal",
    gender: "men",
    sizes: [6, 7, 8, 9, 10, 11],
    price: 1599,
    color: "brown",
    material: "premium leather",
    rating: 4.6,
    inStock: true,
    image: "/images/men_formal_derby.png",
    combos: ["ACC002", "ACC003"],
    tags: ["formal", "office", "leather", "derby", "men"],
  },
  {
    id: "F003",
    name: "Bata Premium Brogue",
    category: "formal",
    gender: "men",
    sizes: [7, 8, 9, 10],
    price: 2199,
    color: "tan",
    material: "italian leather",
    rating: 4.9,
    inStock: true,
    image: "/images/men_formal_brogue_tan.png",
    combos: ["ACC002", "ACC003"],
    tags: ["formal", "office", "leather", "brogue", "premium", "men"],
  },

  // ── MEN'S SPORTS ────────────────────────────────────────────
  {
    id: "S001",
    name: "Bata Power Running",
    category: "sports",
    gender: "men",
    sizes: [7, 8, 9, 10, 11],
    price: 2499,
    color: "white",
    material: "breathable mesh",
    rating: 4.9,
    inStock: true,
    image: "/images/men_sports_running.png",
    combos: ["ACC004", "ACC005"],
    tags: ["sports", "running", "gym", "men", "breathable"],
  },
  {
    id: "S002",
    name: "Bata Power Flex",
    category: "sports",
    gender: "men",
    sizes: [7, 8, 9, 10],
    price: 1999,
    color: "blue",
    material: "knitted fabric",
    rating: 4.7,
    inStock: true,
    image: "/images/men_sports_flex_blue.png",
    combos: ["ACC004"],
    tags: ["sports", "walking", "casual", "men", "lightweight"],
  },
  {
    id: "S003",
    name: "Bata Power Pro",
    category: "sports",
    gender: "men",
    sizes: [8, 9, 10, 11],
    price: 2999,
    color: "grey",
    material: "advanced mesh",
    rating: 4.9,
    inStock: true,
    image: "/images/men_sports_pro_grey.png",
    combos: ["ACC004", "ACC005"],
    tags: ["sports", "pro", "running", "men", "training"],
  },

  // ── KIDS' FOOTWEAR ──────────────────────────────────────────
  {
    id: "K001",
    name: "Bata School Ace",
    category: "kids",
    gender: "kids",
    sizes: [1, 2, 3, 4, 5],
    price: 899,
    color: "black",
    material: "durable leather",
    rating: 4.8,
    inStock: true,
    image: "/images/kids_school_black.png",
    combos: ["ACC004", "ACC011"],
    tags: ["kids", "school", "formal", "uniform"],
  },
  {
    id: "K002",
    name: "Bata Kids Joy",
    category: "kids",
    gender: "kids",
    sizes: [1, 2, 3, 4, 5],
    price: 1199,
    color: "multi",
    material: "synthetic",
    rating: 4.7,
    inStock: true,
    image: "/images/kids_school_casual.png",
    combos: ["ACC004"],
    tags: ["kids", "casual", "play", "sneakers"],
  },
  {
    id: "K003",
    name: "Bata Kids Smart",
    category: "kids",
    gender: "kids",
    sizes: [1, 2, 3, 4, 5],
    price: 999,
    color: "white",
    material: "canvas",
    rating: 4.6,
    inStock: true,
    image: "/images/kids_smart_white.png",
    combos: ["ACC004"],
    tags: ["kids", "sports", "school", "white", "canvas"],
  },
];

// ── ACCESSORIES ─────────────────────────────────────────────────
export const accessories = [
  {
    id: "ACC001",
    name: "Bata Leather Belt — Black",
    category: "accessories",
    price: 599,
    image: "/images/men_belt_leather.png",
    tags: ["belt", "formal", "leather", "men"],
    description: "Premium black leather belt, perfect for formal attire."
  },
  {
    id: "ACC002",
    name: "Bata Leather Belt — Brown",
    category: "accessories",
    price: 599,
    image: "/images/men_belt_brown.png",
    tags: ["belt", "formal", "leather", "men"],
    description: "Elegant brown leather belt to match your Derby shoes."
  },
  {
    id: "ACC004",
    name: "Cotton Comfort Socks",
    category: "accessories",
    price: 199,
    image: "/images/kids_socks_white.png",
    tags: ["socks", "cotton", "comfort"],
    description: "Soft cotton socks for all-day comfort."
  },
  {
    id: "ACC003",
    name: "Shoe Care Kit",
    category: "accessories",
    price: 299,
    image: "/images/shoe_polish_kit.png",
    tags: ["care", "polish"],
    description: "Complete kit to keep your leather shoes shining."
  },
  {
    id: "ACC005",
    name: "Bata Travel Shoe Bag",
    category: "accessories",
    price: 249,
    image: "/images/travel_shoe_bag.png",
    tags: ["bag", "travel"],
    description: "Keep your shoes protected while traveling."
  }
];

// ── COMBO DEALS ──────────────────────────────────────────────────
export const comboDeal = [
  {
    id: "DEAL001",
    name: "Office Starter Pack",
    items: ["F001", "ACC001", "ACC005"],
    discount: 10,
    description: "Oxford shoes + leather belt + shoe bag. Complete your office look!",
    image: "/images/men_formal_oxford.png",
  },
  {
    id: "DEAL002",
    name: "Back to School Combo",
    items: ["K001", "ACC004"],
    discount: 15,
    description: "School shoes + 3-pack cotton socks. The perfect school start!",
    image: "/images/kids_school_black.png",
  },
  {
    id: "DEAL003",
    name: "Executive Elegance Bundle",
    items: ["F002", "ACC002", "ACC003"],
    discount: 12,
    description: "Derby shoes + brown leather belt + shoe care kit. Stay polished!",
    image: "/images/men_formal_derby.png",
  },
  {
    id: "DEAL004",
    name: "Marathon Pro Bundle",
    items: ["S001", "ACC004", "ACC005"],
    discount: 20,
    description: "Running shoes + sports socks + travel bag. For the serious runner!",
    image: "/images/men_sports_running.png",
  },
  {
    id: "DEAL005",
    name: "Weekend Playtime Deal",
    items: ["K002", "ACC004"],
    discount: 8,
    description: "Kids Joy sneakers + comfort socks. Save on comfort!",
    image: "/images/kids_school_casual.png",
  },
  {
    id: "DEAL006",
    name: "Premium Grooming Kit",
    items: ["F003", "ACC003"],
    discount: 5,
    description: "Premium Brogues + Shoe care kit. Keep them looking new!",
    image: "/images/men_formal_oxford.png",
  }
];

// ── HELPER FUNCTIONS ─────────────────────────────────────────────
export function filterProducts({ category, gender, size, maxPrice, minPrice }) {
  return products.filter((p) => {
    if (category && p.category !== category) return false;
    if (gender && p.gender !== gender && p.gender !== "unisex") return false;
    if (size && !p.sizes.includes(Number(size))) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (minPrice && p.price < minPrice) return false;
    return true;
  });
}

export function getAccessoriesForProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return accessories.filter((a) => product.combos && product.combos.includes(a.id));
}

export function getProductById(id) {
  return products.find((p) => p.id === id) || accessories.find((a) => a.id === id);
}

export function buildCatalogSummary() {
  return JSON.stringify({ products, accessories, comboDeal }, null, 2);
}