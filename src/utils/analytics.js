/**
 * Bata AI Copilot — Analytics Logger
 * Uses IndexedDB for larger storage + JSON export for persistence
 */

const DB_NAME = 'bata_copilot_db'
const DB_VERSION = 1
const STORE_NAME = 'analytics'

// ── Open IndexedDB ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('queryType', 'queryType', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Add one entry ──
async function addEntry(entry) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).add(entry)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage', err)
    // ✅ localStorage fallback agar IndexedDB fail ho
    try {
      const raw = localStorage.getItem('bata_analytics_fallback')
      const data = raw ? JSON.parse(raw) : []
      data.push(entry)
      localStorage.setItem('bata_analytics_fallback', JSON.stringify(data.slice(-200)))
    } catch { }
  }
}

// ── Get all entries ──
async function getAllEntries() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('IndexedDB read failed, using localStorage fallback', err)
    try {
      const raw = localStorage.getItem('bata_analytics_fallback')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
}

// ── Clear all entries ──
async function clearAllEntries() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch { }
  try {
    localStorage.removeItem('bata_analytics_fallback')
  } catch { }
}

// ── Query type detector ──
function detectQueryType(query) {
  const q = query.toLowerCase()
  if (q.includes('compare')) return 'comparison'
  if (q.includes('gift') || q.includes('गिफ्ट')) return 'gift'
  if (q.includes('size') || q.includes('साइज़')) return 'size_conversion'
  if (q.includes('outfit') || q.includes('look') || q.includes('लुक')) return 'outfit'
  if (q.includes('combo') || q.includes('deal') || q.includes('कॉम्बो')) return 'combo'
  if (q.includes('weather') || q.includes('rain') || q.includes('monsoon')) return 'weather'
  if (q.includes('formal') || q.includes('office') || q.includes('फॉर्मल')) return 'formal'
  if (q.includes('sports') || q.includes('gym') || q.includes('स्पोर्ट्स')) return 'sports'
  if (q.includes('kids') || q.includes('school') || q.includes('बच्च')) return 'kids'
  if (q.includes('women') || q.includes('heels') || q.includes('हील्स')) return 'women'
  return 'general'
}

// ── PUBLIC: Log a query ──
export async function logQuery(query, response) {
  const entry = {
    timestamp: new Date().toISOString(),
    hour: new Date().getHours(),
    query: query.slice(0, 100),
    productsMentioned: (response?.products || []).map(p => p.name).slice(0, 5),
    accessoriesMentioned: (response?.accessories || []).map(a => a.name).slice(0, 3),
    hadCombo: !!response?.combo,
    hadOutfit: !!response?.outfit,
    queryType: detectQueryType(query),
  }
  await addEntry(entry)
}

// ── PUBLIC: Get aggregated analytics ──
export async function getAnalytics() {
  const data = await getAllEntries()

  if (data.length === 0) {
    return {
      totalQueries: 0,
      todayQueries: 0,
      topQueries: [],
      topProducts: [],
      peakHours: [],
      queryTypes: [],
      dailyTrend: [],
      recentQueries: [],
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayData = data.filter(d => d.timestamp?.startsWith(todayStr))

  const queryFreq = {}
  data.forEach(d => {
    const key = d.query?.toLowerCase().slice(0, 50) || 'unknown'
    queryFreq[key] = (queryFreq[key] || 0) + 1
  })
  const topQueries = Object.entries(queryFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }))

  const productFreq = {}
  data.forEach(d => {
    (d.productsMentioned || []).forEach(name => {
      productFreq[name] = (productFreq[name] || 0) + 1
    })
  })
  const topProducts = Object.entries(productFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  const hourCounts = Array(24).fill(0)
  data.forEach(d => {
    if (d.hour != null) hourCounts[d.hour]++
  })
  const peakHours = hourCounts.map((count, hour) => ({ hour, count }))

  const typeCounts = {}
  data.forEach(d => {
    const t = d.queryType || 'general'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  })
  const queryTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }))

  const dailyTrend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const count = data.filter(e => e.timestamp?.startsWith(ds)).length
    dailyTrend.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count,
    })
  }

  const recentQueries = [...data].reverse().slice(0, 20)

  return {
    totalQueries: data.length,
    todayQueries: todayData.length,
    topQueries,
    topProducts,
    peakHours,
    queryTypes,
    dailyTrend,
    recentQueries,
  }
}

// ── PUBLIC: Export analytics as JSON file ──
export async function exportAnalytics() {
  const data = await getAllEntries()
  const analytics = await getAnalytics()

  const exportData = {
    exportedAt: new Date().toISOString(),
    summary: {
      totalQueries: analytics.totalQueries,
      todayQueries: analytics.todayQueries,
      topProducts: analytics.topProducts.slice(0, 5),
      topQueryTypes: analytics.queryTypes.slice(0, 5),
    },
    rawEntries: data,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Bata_Analytics_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── PUBLIC: Clear all data ──
export async function clearAnalytics() {
  await clearAllEntries()
}