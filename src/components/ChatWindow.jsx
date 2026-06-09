import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import Dashboard from './Dashboard'
import { StaffLogin, StaffPanel } from './StaffMode'
import { sendMessage, parseClaudeResponse } from '../utils/claudeApi'
import { getWeatherContext, getWeatherEmoji } from '../utils/weatherApi'
import { logQuery } from '../utils/analytics'
import { getWishlist, toggleWishlist } from './ProductCard'

const QUICK_CHIPS = {
  en: [
    '👔 Men\'s Formal Office Shoes',
    '🏃 Sports Shoes for Morning Walks',
    '🎒 Kids\' School Shoes (Black)',
    '📏 Size Calculator',
    '🎁 Gift for my Dad',
    '👟 Shoe Polish & Accessories',
    '🎒 Back to School Combo',
    '💼 Office Style Combo',
  ],
  hi: [
    '👔 पुरुषों के फॉर्मल ऑफिस शूज़',
    '🏃 सुबह की सैर के लिए स्पोर्ट्स शूज़',
    '🎒 बच्चों के स्कूल शूज़ (काले)',
    '📏 साइज कैलकुलेटर',
    '🎁 पापा के लिए गिफ्ट',
    '👟 शू पॉलिश और एसेसरीज',
    '🎒 बैक टू स्कूल कॉम्बो',
    '💼 ऑफिस स्टाइल कॉम्बो',
  ]
}

const WELCOME_EN = {
  role: 'assistant',
  content: '',
  parsed: {
    message: `Namaste! I'm your Bata AI Assistant. 👟\n\nI can help you with:\n🎙️ Voice Search — tap the mic and speak\n🔊 Read Aloud — tap 🔊 on any reply to hear it\n🌐 Hindi — tap हिं to switch language\n📷 Image Search — upload a shoe photo to find similar\n👟 Size Converter — "I wear Nike size 9"\n👔 Outfit Styling — complete look suggestions\n🎁 Gift Finder — perfect gifts for anyone\n⛅ Weather-Smart — picks based on your weather\n\nWhat are you looking for today?`,
    products: [],
    accessories: [],
    combo: null,
    outfit: null,
  }
}

const WELCOME_HI = {
  role: 'assistant',
  content: '',
  parsed: {
    message: `नमस्ते! मैं आपकी Bata AI Assistant हूँ। 👟\n\nमैं आपकी मदद कर सकती हूँ:\n🎙️ वॉइस सर्च — माइक बटन दबाकर बोलें\n🔊 ज़ोर से पढ़ें — 🔊 बटन दबाएं सुनने के लिए\n🌐 English — EN बटन दबाएं भाषा बदलने के लिए\n📷 इमेज सर्च — जूते की फोटो अपलोड करें\n👟 साइज़ कनवर्टर — "मैं Nike साइज़ 9 पहनता हूँ"\n👔 आउटफिट स्टाइलिंग — पूरा लुक सजेशन\n🎁 गिफ्ट फाइंडर — किसी के लिए भी परफेक्ट गिफ्ट\n⛅ मौसम के अनुसार — मौसम के हिसाब से सिफारिश\n\nआज आप क्या ढूंढ रहे हैं?`,
    products: [],
    accessories: [],
    combo: null,
    outfit: null,
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function ChatWindow() {
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState([WELCOME_EN])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)
  const imageInputRef = useRef(null)
  const [pendingImage, setPendingImage] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showStaffLogin, setShowStaffLogin] = useState(false)
  const [isStaffMode, setIsStaffMode] = useState(false)
  const [staffAction, setStaffAction] = useState(null) // 'dashboard' or 'staffPanel'
  // ✅ Task 11
  const [showWishlist, setShowWishlist] = useState(false)
  const [wishlistItems, setWishlistItems] = useState([])
  // ✅ Task 12
  const [showStarters, setShowStarters] = useState(true)

  // ✅ Task 16 & 17
  const [showSizeCalc, setShowSizeCalc] = useState(false)
  const [cmInput, setCmInput] = useState('')
  const [isDark, setIsDark] = useState(() => localStorage.getItem('bata_dark') === 'true')
  // ✅ lang ki latest value hamesha milegi
const langRef = useRef(lang)
useEffect(() => {
  langRef.current = lang
}, [lang])

const resetChat = useCallback(() => {
  setMessages([langRef.current === 'hi' ? WELCOME_HI : WELCOME_EN])
  setInput('')
  setPendingImage(null)
  setShowStarters(true)
}, []) // ✅ ab koi dependency nahi — ref se latest value milegi

  useEffect(() => {
    localStorage.setItem('bata_dark', isDark)
  }, [isDark])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    getWeatherContext().then(ctx => {
      if (ctx) {
        setWeather(ctx)
        console.log('Weather loaded:', ctx.displayText)
      }
    })
  }, [])
  // ✅ Task 14 — Offline fallback ← YEH NAYA ADD KARO YAHAN
  useEffect(() => {
    function handleOffline() {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        parsed: {
          message: `📵 Internet connection nahi hai.\n\nKripaya humara nearest Bata store visit karein:`,
          offlineLink: 'https://www.google.com/maps/search/Bata+store+near+me',
          retryText: 'Ya thodi der baad dobara try karein.',
          products: [],
          accessories: [],
          combo: null,
          outfit: null,
        }
      }])
    }

    window.addEventListener('offline', handleOffline)
    return () => window.removeEventListener('offline', handleOffline)
  }, [])
  const doSend = useCallback(async (updatedMessages, imageData = null) => {
    setLoading(true)
    try {
      const history = updatedMessages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
        .map(m => ({ role: m.role, content: m.content || m.parsed?.message || '' }))

      const weatherPrompt = weather?.promptText || ''
      const rawResponse = await sendMessage(history, weatherPrompt, lang, imageData)
      const parsed = parseClaudeResponse(rawResponse)

      const lastUserMsg = updatedMessages.filter(m => m.role === 'user').pop()
      if (lastUserMsg) logQuery(lastUserMsg.content, parsed)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: rawResponse,
        parsed
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        parsed: {
          message: `Sorry, I'm having trouble connecting right now. Please try again in a moment.\n\nError: ${err.message}`,
          products: [],
          accessories: [],
          combo: null,
          outfit: null,
          isError: true,
        }
      }])
    } finally {
      setLoading(false)
    }
  }, [weather, lang])

  const handleSendDirect = useCallback(async (text) => {
    const userText = text.trim()
    if (!userText) return

    // ✅ Task 16 Interceptor
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('size calc') || lowerText.includes('साइज कैल') || lowerText.includes('size calculator')) {
      setShowSizeCalc(true);
      return;
    }

    const userMsg = { role: 'user', content: userText }
    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    await doSend(updatedMessages)
  }, [messages, doSend])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    if (recognitionRef.current) recognitionRef.current.abort()

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      setTimeout(() => handleSendDirect(transcript), 400)
    }
    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [handleSendDirect, lang])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Image is too large. Please upload an image under 4MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64Full = reader.result
      setPendingImage({
        base64: base64Full.split(',')[1],
        mimeType: file.type,
        preview: base64Full,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSend(text) {
    const userText = (text || input).trim()
    if (!userText && !pendingImage) return
    if (loading) return

    // ✅ Task 16 Interceptor
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('size calc') || lowerText.includes('साइज कैल') || lowerText.includes('size calculator')) {
      setShowSizeCalc(true);
      setInput('');
      return;
    }

    // ✅ Task 12 — starters hide karo jab user pehla message bheje
    setShowStarters(false)

    const imageData = pendingImage
    const msgText = userText || (lang === 'hi' ? '📸 इस जूते जैसा Bata में दिखाओ' : '📸 Find shoes like this in Bata')

    const userMsg = {
      role: 'user',
      content: msgText,
      imagePreview: imageData?.preview || null,
    }
    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setPendingImage(null)

    await doSend(updatedMessages, imageData)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function exportChat() {
    if (messages.length <= 1) return

    let text = '═══════════════════════════════════\n'
    text += '   🛍️ BATA AI COPILOT — Chat Export\n'
    text += '═══════════════════════════════════\n'
    text += `📅 Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n`
    text += `🕐 Time: ${new Date().toLocaleTimeString('en-IN')}\n`
    if (weather) text += `⛅ Weather: ${weather.displayText}\n`
    text += '───────────────────────────────────\n\n'

    messages.forEach((msg, i) => {
      if (i === 0) return
      if (msg.role === 'user') {
        text += `👤 YOU: ${msg.content}\n\n`
      } else {
        const p = msg.parsed
        if (p?.message) text += `🤖 BATA AI: ${p.message}\n`
        if (p?.products?.length > 0) {
          text += '\n📦 Recommended Products:\n'
          p.products.forEach(pr => {
            text += `   • ${pr.name} — ₹${pr.price} | ${pr.material || ''} | Sizes: ${pr.sizes?.join(', ') || 'N/A'} | ⭐ ${pr.rating || 'N/A'}\n`
          })
        }
        if (p?.accessories?.length > 0) {
          text += '\n👜 Accessories:\n'
          p.accessories.forEach(a => {
            text += `   • ${a.name} — ₹${a.price}\n`
          })
        }
        if (p?.combo) {
          text += `\n🎁 Combo Deal: ${p.combo.name} — ${p.combo.totalSaving}\n`
        }
        text += '\n───────────────────────────────────\n\n'
      }
    })

    text += '🏪 Visit your nearest Bata store!\n'
    text += '🌐 www.bata.in\n'
    text += '━━━ Sent via Bata AI Assistant ━━━\n'

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Bata_Recommendations_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={isDark ? 'dark-mode-wrapper' : ''} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: 780,
      width: '100%',
      margin: '0 auto',
      background: '#f7f7f7',

    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #CC0000 0%, #a00000 100%)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(204,0,0,0.35)'
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 16, color: '#CC0000'
        }}>B</div>

        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Bata AI Assistant</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Your smart footwear assistant</div>
        </div>

        {weather && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20, padding: '5px 12px',
            fontSize: 12, color: '#fff', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 5,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <span>{getWeatherEmoji(weather.main)}</span>
            <span>{weather.displayText}</span>
          </div>
        )}

        {/* Dashboard (Locked) */}
        <button onClick={() => { setStaffAction('dashboard'); setShowStaffLogin(true); }} title="Store Manager Dashboard"
          style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        >📊</button>

        {/* ✅ Task 11 — Wishlist Button */}
        <button
          onClick={() => {
            setWishlistItems(getWishlist())
            setShowWishlist(true)
          }}
          title="My Wishlist"
          style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        >❤️</button>




        {/* ✅ Task 17 — Dark Mode */}
        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle Dark Mode"
          style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        >{isDark ? '☀️' : '🌙'}</button>

        {/* Language */}
        <button
          onClick={() => {
            const newLang = lang === 'en' ? 'hi' : 'en'
            setLang(newLang)
            setMessages([newLang === 'hi' ? WELCOME_HI : WELCOME_EN])
            setShowStarters(true)
          }}
          title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          style={{ 
            background: 'rgba(255,255,255,0.25)', 
            border: '1px solid rgba(255,255,255,0.4)', 
            borderRadius: 20, 
            padding: '4px 12px', 
            fontSize: 12, 
            color: '#fff', 
            fontWeight: 700, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4 
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
        >
          🌐 {lang === 'en' ? 'English' : 'हिन्दी'}
        </button>

        {/* Staff */}
        <button
          onClick={() => isStaffMode ? setIsStaffMode(false) : setShowStaffLogin(true)}
          title={isStaffMode ? 'Exit Staff Mode' : 'Staff Login'}
          style={{ background: isStaffMode ? '#fff' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 32, height: 32, color: isStaffMode ? '#CC0000' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}
        >{isStaffMode ? '🔓' : '🔒'}</button>

        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          AI Powered
        </div>
      </div>

      {/* Features Banner */}
      <div style={{ padding: '8px 16px', background: 'linear-gradient(90deg, #fff5f5 0%, #fef9f0 50%, #f5f5ff 100%)', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #f0e8e0' }}>
        {[
          { icon: '🎙️', label: 'Voice' },
          { icon: '🔊', label: 'Read Aloud' },
          { icon: '🌐', label: lang === 'hi' ? 'हिन्दी' : 'Hindi' },
          { icon: '⛅', label: 'Weather' },
          { icon: '👟', label: 'Fit Guide' },
          { icon: '👔', label: 'Outfit' },
          { icon: '📷', label: lang === 'hi' ? 'इमेज सर्च' : 'Image Search' },
          { icon: '🎁', label: 'Gifts' },
          { icon: '❤️', label: 'Wishlist' },
        ].map(f => (
          <div key={f.label} style={{ background: '#fff', border: '1px solid #f0e8e0', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#555', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontSize: 12 }}>{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column' }}>

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            lang={lang}
            onRetry={msg.parsed?.isError ? () => {
              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
              if (lastUserMsg) {
                setMessages(prev => prev.slice(0, -1))
                handleSendDirect(lastUserMsg.content)
              }
            } : null}
          />
        ))}

        {/* ✅ Task 12 — Conversation Starters */}
        {showStarters && messages.length === 1 && (
          <div style={{ margin: '8px 0 16px', padding: 16, background: '#fff', borderRadius: 16, border: '1px solid #f0e8e0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {lang === 'hi' ? 'आज आप क्या ढूंढ रहे हैं?' : 'What brings you here today?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '👔', label: lang === 'hi' ? 'ऑफिस और स्पोर्ट्स शॉपिंग' : 'Shopping for Office & Gym', query: 'I need black shoes for my new office job' },
                { emoji: '🎒', label: lang === 'hi' ? 'बच्चों की स्कूल शॉपिंग' : 'Kids School Shopping', query: 'Looking for school shoes for my son' },
                { emoji: '🎁', label: lang === 'hi' ? 'गिफ्ट खरीदना है' : 'Buying a gift', query: 'Help me find a gift for someone' },
                { emoji: '💰', label: lang === 'hi' ? 'डील्स और ऑफर्स' : 'Looking for deals', query: 'Show combo deals and offers' },
              ].map(s => (
                <button
                  key={s.label}
                  onClick={() => {
                    setShowStarters(false)
                    handleSend(s.query)
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fafafa', border: '1px solid #f0e8e0', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fff5f5'
                    e.currentTarget.style.borderColor = '#ffd6d6'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fafafa'
                    e.currentTarget.style.borderColor = '#f0e8e0'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{s.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#CC0000' }}>→</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStarters(false)}
              style={{ marginTop: 10, background: 'none', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', width: '100%' }}
            >
              {lang === 'hi' ? 'स्किप करें — मैं खुद लिखूंगा' : 'Skip — I\'ll type my own query'}
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>B</div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '4px 18px 18px 18px', padding: '12px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#CC0000', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Chips */}
      {(() => {
        const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.parsed?.suggestions?.length > 0)
        const dynamicChips = lastAssistant?.parsed?.suggestions || []
        const chips = dynamicChips.length > 0 ? dynamicChips : (QUICK_CHIPS[lang] || QUICK_CHIPS.en)
        const isDynamic = dynamicChips.length > 0
        return (
          <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0, background: '#f7f7f7', alignItems: 'center' }}>
            {isDynamic && (
              <span style={{ fontSize: 10, color: '#CC0000', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, padding: '3px 8px', background: '#fff5f5', borderRadius: 10, border: '1px solid #ffd6d6' }}>✨ Suggested</span>
            )}
            {chips.map(chip => (
              <button key={chip} onClick={() => handleSend(chip)}
                style={{ background: isDynamic ? 'linear-gradient(135deg, #fff5f5, #fff)' : '#fff', border: isDynamic ? '1px solid #ffd6d6' : '1px solid #e0e0e0', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: isDynamic ? '#CC0000' : '#333', fontWeight: isDynamic ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => { e.target.style.background = '#CC0000'; e.target.style.color = '#fff'; e.target.style.borderColor = '#CC0000' }}
                onMouseLeave={e => { e.target.style.background = isDynamic ? 'linear-gradient(135deg, #fff5f5, #fff)' : '#fff'; e.target.style.color = isDynamic ? '#CC0000' : '#333'; e.target.style.borderColor = isDynamic ? '#ffd6d6' : '#e0e0e0' }}
              >
                {chip.length > 40 ? chip.slice(0, 37) + '...' : chip}
              </button>
            ))}
          </div>
        )
      })()}

      {/* Image Preview */}
      {pendingImage && (
        <div style={{ padding: '8px 16px 0', background: '#f7f7f7', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #CC0000' }}>
            <img src={pendingImage.preview} alt="Upload preview" style={{ width: 60, height: 60, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => setPendingImage(null)}
              style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#CC0000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            📸 {lang === 'hi' ? 'इमेज तैयार — भेजें या टेक्स्ट जोड़ें' : 'Image ready — send or add text'}
          </div>
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* Input Bar */}
      <div style={{ padding: '12px 16px 16px', background: '#f7f7f7', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <button onClick={isListening ? stopListening : startListening} disabled={loading}
          style={{ width: 44, height: 44, borderRadius: '50%', background: isListening ? '#CC0000' : '#fff', border: isListening ? '2px solid #CC0000' : '1.5px solid #e0e0e0', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none' }}
        >
          {isListening ? (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 3, height: 14, background: '#fff', borderRadius: 2, animation: `soundWave 0.8s ease-in-out ${i * 0.15}s infinite alternate` }} />
              ))}
            </div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="#CC0000" />
              <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17Z" fill="#CC0000" />
            </svg>
          )}
        </button>

        <button onClick={() => imageInputRef.current?.click()} disabled={loading}
          style={{ width: 44, height: 44, borderRadius: '50%', background: pendingImage ? '#CC0000' : '#fff', border: pendingImage ? '2px solid #CC0000' : '1.5px solid #e0e0e0', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke={pendingImage ? '#fff' : '#CC0000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="4" stroke={pendingImage ? '#fff' : '#CC0000'} strokeWidth="2" />
          </svg>
        </button>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isListening
            ? (lang === 'hi' ? '🎙️ सुन रहा हूँ... अब बोलिए' : '🎙️ Listening... speak now')
            : (lang === 'hi' ? 'कुछ भी पूछें — साइज़, बजट, मौका, गिफ्ट...' : 'Ask me anything — size, budget, occasion, gift...')}
          rows={1}
          style={{ flex: 1, border: isListening ? '1.5px solid #CC0000' : '1.5px solid #e0e0e0', borderRadius: 24, padding: '10px 18px', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', background: isListening ? '#fff5f5' : '#fff', color: '#1a1a1a', lineHeight: 1.5 }}
          onFocus={e => { if (!isListening) e.target.style.borderColor = '#CC0000' }}
          onBlur={e => { if (!isListening) e.target.style.borderColor = '#e0e0e0' }}
        />



        <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !pendingImage)}
          style={{ width: 44, height: 44, borderRadius: '50%', background: (loading || (!input.trim() && !pendingImage)) ? '#e0e0e0' : '#CC0000', border: 'none', cursor: (loading || (!input.trim() && !pendingImage)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-5px); opacity: 1; } }
        @keyframes micPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(204,0,0,0.3); } 50% { box-shadow: 0 0 0 10px rgba(204,0,0,0); } }
        @keyframes soundWave { from { height: 6px; } to { height: 16px; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
         .dark-mode-wrapper { filter: invert(1) hue-rotate(180deg); }
.dark-mode-wrapper img { filter: invert(1) hue-rotate(180deg); }
      `}</style>

      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
      {showStaffLogin && (
        <StaffLogin 
          onLogin={() => { 
            setShowStaffLogin(false); 
            if (staffAction === 'dashboard') {
              setShowDashboard(true);
            } else {
              setIsStaffMode(true);
            }
            setStaffAction(null);
          }} 
          onClose={() => {
            setShowStaffLogin(false);
            setStaffAction(null);
          }} 
        />
      )}
      {isStaffMode && <StaffPanel onLogout={() => setIsStaffMode(false)} lang={lang} />}

      {/* ✅ Task 11 — Wishlist Panel */}
      {showWishlist && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>❤️ My Wishlist</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</div>
              </div>
              <button onClick={() => setShowWishlist(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}
              >✕</button>
            </div>

            <div style={{ padding: 16 }}>
              {wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>No items saved yet</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Tap 🤍 on any product to save it here</div>
                </div>
              ) : (
                wishlistItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.color} · {item.material} · Sizes: {item.sizes?.join(', ')}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#CC0000', marginTop: 2 }}>₹{item.price?.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => { toggleWishlist(item); setWishlistItems(getWishlist()) }}
                      style={{ background: '#fff5f5', border: '1px solid #ffd6d6', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#CC0000', cursor: 'pointer', fontWeight: 600 }}
                    >Remove</button>
                  </div>
                ))
              )}

              {wishlistItems.length > 0 && (
                <button
                  onClick={() => {
                    let text = '🛍️ *My Bata Wishlist*\n\n'
                    wishlistItems.forEach(item => { text += `👟 ${item.name} — ₹${item.price}\n` })
                    text += '\n🏪 Visit Bata store to try these!'
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  style={{ width: '100%', marginTop: 16, padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >💬 Share Wishlist on WhatsApp</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Task 16 — Size Calculator Panel */}
      {showSizeCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 350, padding: 24, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📏</div>
            <h3 style={{ margin: 0, color: '#1a1a1a' }}>Bata Size Calculator</h3>
            <p style={{ fontSize: 13, color: '#888', marginTop: 8, marginBottom: 20 }}>Enter your foot length in cm to find your perfect Bata size. Pure JS, No AI tokens used!</p>

            <input
              type="number"
              value={cmInput}
              onChange={e => setCmInput(e.target.value)}
              placeholder="e.g. 26"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 18, textAlign: 'center', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#CC0000'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />

            {cmInput && cmInput > 10 && (
              <div style={{ background: '#f0faf4', border: '1px solid #b8e8c8', padding: 16, borderRadius: 8, marginTop: 16, color: '#1a7a3a', fontWeight: 800, fontSize: 18 }}>
                Suggested Size: UK {Math.max(1, Math.min(12, Math.round(Number(cmInput) - 19)))}
              </div>
            )}

            <button
              onClick={() => { setShowSizeCalc(false); setCmInput(''); }}
              style={{ width: '100%', padding: 12, background: '#CC0000', color: '#fff', borderRadius: 8, border: 'none', marginTop: 16, cursor: 'pointer', fontWeight: 600 }}
            >Done</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default ChatWindow