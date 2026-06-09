import { useState } from 'react'

// ✅ ENV se PIN lo — DevTools mein source code nahi dikhega
const STAFF_PIN = import.meta.env.VITE_STAFF_PIN || '0000'

function StaffLogin({ onLogin, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  // ✅ Lockout after 3 wrong attempts
  const handleSubmit = (e) => {
    e.preventDefault()
    if (locked) return

    if (pin === STAFF_PIN) {
      setAttempts(0)
      onLogin()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPin('')

      // ✅ 3 wrong attempts — 30 second lockout
      if (newAttempts >= 3) {
        setLocked(true)
        setError('Too many attempts. Locked for 30 seconds.')
        let seconds = 30
        setLockTimer(seconds)
        const interval = setInterval(() => {
          seconds -= 1
          setLockTimer(seconds)
          if (seconds <= 0) {
            clearInterval(interval)
            setLocked(false)
            setAttempts(0)
            setError('')
          }
        }, 1000)
      }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 340,
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: shake ? 'staffShake 0.4s ease' : 'none',
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: locked
            ? 'linear-gradient(135deg, #888, #555)'
            : 'linear-gradient(135deg, #CC0000, #8B0000)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 24,
        }}>
          {locked ? '⏳' : '🔒'}
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>
          Staff Access
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
          {locked
            ? `Locked — try again in ${lockTimer}s`
            : 'Enter PIN to access staff features'}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ✅ PIN dots display */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: pin.length > i ? '#CC0000' : '#e0e0e0',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>

          <input
            type="password"
            value={pin}
            onChange={e => {
              if (!locked) {
                setPin(e.target.value)
                setError('')
              }
            }}
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            autoFocus
            disabled={locked}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 24,
              letterSpacing: 12,
              textAlign: 'center',
              border: error ? '2px solid #CC0000' : '2px solid #e0e0e0',
              borderRadius: 12,
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              background: locked ? '#f5f5f5' : '#fff',
              cursor: locked ? 'not-allowed' : 'text',
            }}
            onFocus={e => { if (!error && !locked) e.target.style.borderColor = '#CC0000' }}
            onBlur={e => { if (!error) e.target.style.borderColor = '#e0e0e0' }}
          />

          {error && (
            <div style={{
              color: locked ? '#888' : '#CC0000',
              fontSize: 12,
              marginTop: 8,
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {/* ✅ Attempts indicator */}
          {attempts > 0 && !locked && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginTop: 8,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i < attempts ? '#CC0000' : '#e0e0e0',
                }} />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length < 4 || locked}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 16,
              background: (pin.length >= 4 && !locked)
                ? 'linear-gradient(135deg, #CC0000, #a00000)'
                : '#e0e0e0',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: (pin.length >= 4 && !locked) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {locked ? `Locked (${lockTimer}s)` : 'Unlock Staff Mode'}
          </button>
        </form>

        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >Cancel</button>
      </div>

      <style>{`
        @keyframes staffShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  )
}

function StaffPanel({ onLogout, lang }) {
  const [activeTab, setActiveTab] = useState('stock')

  const mockStock = [
    { name: 'Ambassador Classic', sku: 'BAT-AMB-001', stock: 24, status: 'In Stock' },
    { name: 'Power Sports Pro', sku: 'BAT-PWR-003', stock: 8, status: 'Low Stock' },
    { name: 'Comfit Slip-On', sku: 'BAT-CMF-002', stock: 0, status: 'Out of Stock' },
    { name: 'Hush Puppies Derby', sku: 'BAT-HSH-001', stock: 15, status: 'In Stock' },
    { name: 'North Star Canvas', sku: 'BAT-NST-002', stock: 3, status: 'Low Stock' },
    { name: 'Weinbrenner Boots', sku: 'BAT-WNB-001', stock: 12, status: 'In Stock' },
    { name: 'Bata Red Label Heels', sku: 'BAT-RED-001', stock: 6, status: 'In Stock' },
    { name: 'Floatz Slides', sku: 'BAT-FLZ-003', stock: 30, status: 'In Stock' },
  ]

  const mockCombos = [
    { name: 'Formal Complete', items: 'Derby + Belt + Socks', margin: '32%', price: '₹3,299' },
    { name: 'Sports Bundle', items: 'Power Shoe + Water Bottle + Cap', margin: '28%', price: '₹2,499' },
    { name: 'Monsoon Ready', items: 'Floatz + Rain Cover + Bag', margin: '35%', price: '₹1,799' },
    { name: 'Kids School Kit', items: 'School Shoe + Socks + Polish', margin: '40%', price: '₹1,299' },
  ]

  const todayStats = {
    totalSales: '₹47,820',
    transactions: 23,
    avgOrder: '₹2,079',
    topSelling: 'Power Sports Pro',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)',
      zIndex: 1500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 700,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #333)',
          padding: '16px 24px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>🔒 Staff Mode</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Bata Store Management</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: '#CC0000',
              border: 'none',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >🚪 Logout</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {[
            { key: 'stock', label: '📦 Stock Check' },
            { key: 'combos', label: '💰 Combo Margins' },
            { key: 'reports', label: '📋 Daily Report' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: activeTab === tab.key ? '#fff' : '#f8f8f8',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #CC0000' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#CC0000' : '#888',
                transition: 'all 0.2s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📦 Live Stock Status</div>
              <div style={{ borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 60px 90px',
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#888',
                }}>
                  <span>Product</span>
                  <span>SKU</span>
                  <span>Qty</span>
                  <span>Status</span>
                </div>
                {mockStock.map(item => (
                  <div key={item.sku} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 60px 90px',
                    padding: '10px 12px',
                    borderTop: '1px solid #f0f0f0',
                    fontSize: 12,
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, color: '#333' }}>{item.name}</span>
                    <span style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 10 }}>{item.sku}</span>
                    <span style={{
                      fontWeight: 700,
                      color: item.stock === 0 ? '#CC0000' : item.stock <= 5 ? '#f59e0b' : '#059669'
                    }}>
                      {item.stock}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: item.stock === 0 ? '#fee2e2' : item.stock <= 5 ? '#fef3c7' : '#dcfce7',
                      color: item.stock === 0 ? '#CC0000' : item.stock <= 5 ? '#b45309' : '#059669',
                      textAlign: 'center',
                    }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combos Tab */}
          {activeTab === 'combos' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💰 Combo Deal Margins</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {mockCombos.map(combo => (
                  <div key={combo.name} style={{
                    border: '1px solid #eee',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{combo.name}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{combo.items}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#CC0000', marginTop: 4 }}>{combo.price}</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 800,
                    }}>{combo.margin}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Today's Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Sales', value: todayStats.totalSales, icon: '💰', color: '#059669' },
                  { label: 'Transactions', value: todayStats.transactions, icon: '🧾', color: '#2563eb' },
                  { label: 'Avg Order Value', value: todayStats.avgOrder, icon: '📊', color: '#7c3aed' },
                  { label: 'Top Selling', value: todayStats.topSelling, icon: '🏆', color: '#CC0000' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: '#f8f8f8',
                    borderRadius: 12,
                    padding: 14,
                    textAlign: 'center',
                    border: '1px solid #eee',
                  }}>
                    <div style={{ fontSize: 20 }}>{stat.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const report = `BATA STORE DAILY REPORT\n${'='.repeat(30)}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nTotal Sales: ${todayStats.totalSales}\nTransactions: ${todayStats.transactions}\nAvg Order: ${todayStats.avgOrder}\nTop Selling: ${todayStats.topSelling}\n\nGenerated by Bata AI Assistant`
                  const blob = new Blob([report], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `Bata_Daily_Report_${new Date().toISOString().slice(0, 10)}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'linear-gradient(135deg, #CC0000, #a00000)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >📥 Download Daily Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { StaffLogin, StaffPanel }