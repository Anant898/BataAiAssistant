import { useState } from 'react'
import { ProductCard, AccessoryCard, ComboCard } from './ProductCard'
import OutfitCard from './OutfitCard'

/* ───── Text-to-Speech Helper ─────── */
let activeUtterance = null; // Prevent GC

function speakText(text, lang, onEnd) {
  window.speechSynthesis.cancel()
  
  const startSpeaking = () => {
    activeUtterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find a female voice for the target language
    let selectedVoice = null
    if (lang === 'hi') {
      // Common Hindi Female voices: Google Hindi, Microsoft Heera
      selectedVoice = voices.find(v => v.lang.includes('hi') && (v.name.includes('Google') || v.name.includes('Heera') || v.name.includes('Female')))
    } else {
      // Common English Female voices: Google US English, Microsoft Zira, etc.
      selectedVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Female') || v.name.includes('Samantha')))
    }

    if (selectedVoice) activeUtterance.voice = selectedVoice
    activeUtterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    activeUtterance.rate = 1
    activeUtterance.pitch = 1.1 // Slightly higher pitch for a clearer female tone
    
    activeUtterance.onend = () => {
      activeUtterance = null
      onEnd()
    }
    
    activeUtterance.onerror = (e) => {
      console.error('Speech error:', e)
      activeUtterance = null
      onEnd()
    }
    
    window.speechSynthesis.speak(activeUtterance)
  }

  // Chrome loads voices async
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = startSpeaking
  } else {
    startSpeaking()
  }
}

function stopSpeaking() {
  window.speechSynthesis.cancel()
}

// ✅ Issue #10 Fix — onRetry prop add kiya
function MessageBubble({ message, lang = 'en', onRetry }) {
  const isUser = message.role === 'user'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [feedback, setFeedback] = useState(null) // ✅ Task 15

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }

    const text = message.parsed?.message || message.content || ''
    if (!text) return

    let cleanText = text
      .replace(/[^\w\s\u0900-\u097F.,!?₹;:'"()\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // ✅ Task 18 — Pronunciation Fixes
    if (lang === 'hi') {
      cleanText = cleanText
        .replace(/\bAI\b/gi, 'एआई')
        .replace(/\bBata\b/gi, 'बाटा')
    } else {
      cleanText = cleanText
        .replace(/\bAI\b/gi, 'A.I.')
        .replace(/\bBata\b/gi, 'Bah-tah')
    }

    setIsSpeaking(true)
    speakText(cleanText, lang, () => setIsSpeaking(false))
  }

  // ✅ Task 15 — Local Storage Feedback
 const handleFeedback = (type) => {
  setFeedback(type);
  const existing = JSON.parse(localStorage.getItem('bata_feedback') || '[]');
  existing.push({ 
    type, 
    message: message.parsed?.message?.slice(0, 50) || '', // ✅ message.parsed use karo
    time: new Date().toISOString() 
  });
  localStorage.setItem('bata_feedback', JSON.stringify(existing));
};

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{
          background: '#CC0000',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 16px',
          maxWidth: '70%',
          fontSize: 14,
          lineHeight: 1.5
        }}>
          {message.imagePreview && (
            <img
              src={message.imagePreview}
              alt="Uploaded shoe"
              style={{
                width: '100%',
                maxWidth: 200,
                borderRadius: 10,
                marginBottom: 8,
                display: 'block',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            />
          )}
          {message.content}
        </div>
      </div>
    )
  }

  const parsed = message.parsed

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#CC0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        marginTop: 2
      }}>B</div>

      <div style={{ flex: 1, maxWidth: 'calc(100% - 42px)' }}>
        {parsed?.message && (
          <div style={{ position: 'relative' }}>
            <div style={{
              background: parsed?.isError ? '#fff5f5' : '#fff',
              border: parsed?.isError ? '1px solid #ffd6d6' : '1px solid #f0f0f0',
              borderRadius: '4px 18px 18px 18px',
              padding: '10px 16px',
              paddingRight: 80,
              fontSize: 14,
              lineHeight: 1.6,
              color: '#1a1a1a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              whiteSpace: 'pre-wrap'
            }}>
              {parsed.message}

              {/* ✅ Issue #10 Fix — Retry button error message ke andar */}
              {parsed?.isError && onRetry && (
                <button
                  onClick={onRetry}
                  style={{
                    display: 'block',
                    marginTop: 12,
                    padding: '8px 20px',
                    background: '#CC0000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#a00000'}
                  onMouseLeave={e => e.target.style.background = '#CC0000'}
                >
                  🔄 Try Again
                </button>
              )}

              {/* ✅ Task 14 — Offline fallback link */}
              {parsed?.offlineLink && (
                <a
                  href={parsed.offlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: '#185FA5',
                    fontSize: 13,
                    wordBreak: 'break-all',
                    textDecoration: 'underline',
                  }}
                >
                  👉 {parsed.offlineLink}
                </a>
              )}

              {/* ✅ Task 14 — Retry text */}
              {parsed?.retryText && (
                <p style={{ color: '#888', fontSize: 13, margin: '6px 0 0' }}>
                  {parsed.retryText}
                </p>
              )}

              {/* ✅ Task 15 — Feedback Buttons */}
              {!parsed?.isError && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>Was this helpful?</span>
                  <button onClick={() => handleFeedback('up')} style={{ background: feedback === 'up' ? '#dcf8c6' : '#f5f5f5', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>👍</button>
                  <button onClick={() => handleFeedback('down')} style={{ background: feedback === 'down' ? '#ffe5e5' : '#f5f5f5', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>👎</button>
                </div>
              )}
            </div>

            {/* Action Buttons Row — sirf non-error messages pe */}
            {!parsed?.isError && (
              <div style={{
                position: 'absolute',
                top: 6,
                right: 6,
                display: 'flex',
                gap: 4,
              }}>
                {/* 🔊 Text-to-Speech Button */}
                <button
                  onClick={handleSpeak}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: 'none',
                    background: isSpeaking ? '#CC0000' : '#f5f5f5',
                    color: isSpeaking ? '#fff' : '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    transition: 'all 0.2s',
                    animation: isSpeaking ? 'speakerPulse 1.5s ease-in-out infinite' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSpeaking) {
                      e.target.style.background = '#ffe5e5'
                      e.target.style.color = '#CC0000'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSpeaking) {
                      e.target.style.background = '#f5f5f5'
                      e.target.style.color = '#888'
                    }
                  }}
                >
                  {isSpeaking ? '⏹' : '🔊'}
                </button>

                {/* 💬 WhatsApp Share Button */}
                <button
                  onClick={() => {
                    let shareText = `🛍️ *Bata AI Assistant Recommendation*\n\n${parsed.message}\n`
                    if (parsed.products?.length > 0) {
                      shareText += `\n📦 *Products:*\n`
                      parsed.products.forEach(p => {
                        shareText += `• ${p.name} — ₹${p.price} (${p.material || p.color || ''})\n`
                      })
                    }
                    if (parsed.accessories?.length > 0) {
                      shareText += `\n👜 *Accessories:*\n`
                      parsed.accessories.forEach(a => {
                        shareText += `• ${a.name} — ₹${a.price}\n`
                      })
                    }
                    shareText += `\n🏪 Visit your nearest Bata store!\n_Sent via Bata AI Assistant_`
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
                    window.open(waUrl, '_blank')
                  }}
                  title="Share on WhatsApp"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f5f5f5',
                    color: '#25D366',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#dcf8c6'}
                  onMouseLeave={e => e.target.style.background = '#f5f5f5'}
                >
                  💬
                </button>
              </div>
            )}
          </div>
        )}

        {parsed?.products?.length > 0 && (
          // ✅ Task 13 — <> fragment mein wrap karo
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {parsed.products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* ✅ Task 13 — Print button */}
            <button
              onClick={() => {
                const win = window.open('', '_blank')
                const html = `
                  <html><head><title>Bata Recommendation</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; }
                    h2 { color: #CC0000; }
                    .product { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin: 12px 0; }
                    .price { color: #CC0000; font-size: 20px; font-weight: bold; }
                    .footer { margin-top: 30px; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px; }
                  </style></head><body>
                  <h2>🛍️ Bata AI Recommendation</h2>
                  <p style="color:#555">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  ${parsed.products.map(p => `
                    <div class="product">
                      <strong>${p.name}</strong><br/>
                      <span class="price">₹${p.price}</span><br/>
                      <span style="color:#555;font-size:13px">Sizes: ${p.sizes?.join(', ') || 'N/A'} | ${p.color || ''} | ${p.material || ''}</span><br/>
                      <span style="color:#666;font-size:13px">⭐ ${p.rating || 'N/A'} — ${p.reason || ''}</span>
                    </div>
                  `).join('')}
                  <div class="footer">🏪 Visit your nearest Bata store | www.bata.in | Sent via Bata AI Assistant</div>
                  </body></html>
                `
                win.document.write(html)
                win.document.close()
                win.print()
              }}
              style={{
                marginTop: 8,
                padding: '6px 16px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 20,
                fontSize: 12,
                color: '#555',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#CC0000'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              🖨️ Print / Save Card
            </button>
          </>
        )}

        {parsed?.accessories?.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {Array.from(new Set(parsed.accessories.map(a => a.id)))
              .map(id => parsed.accessories.find(a => a.id === id))
              .map((a, i) => <AccessoryCard key={`${a.id}-${i}`} accessory={a} />)
            }
          </div>
        )}

        {parsed?.outfit && (
          <OutfitCard outfit={parsed.outfit} />
        )}

        {parsed?.combo && (
          <ComboCard combo={parsed.combo} />
        )}
      </div>

      <style>{`
        @keyframes speakerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204,0,0,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(204,0,0,0); }
        }
      `}</style>
    </div>
  )
}

export default MessageBubble
// window.dispatchEvent(new Event('offline'))