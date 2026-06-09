import { useState, useEffect } from 'react'
import { getAnalytics, clearAnalytics, exportAnalytics } from '../utils/analytics'

function Dashboard({ onClose }) {
  const [data, setData] = useState(null)

  // Fixed - refreshes every 5 seconds automatically
  useEffect(() => {
    const load = async () => {
      const result = await getAnalytics()
      setData(result)
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return null

  const maxHourCount = Math.max(...data.peakHours.map(h => h.count), 1)
  const maxDailyCount = Math.max(...data.dailyTrend.map(d => d.count), 1)

  // ✅ Task 15 — Load Feedback Stats
  const feedbacks = JSON.parse(localStorage.getItem('bata_feedback') || '[]');
  const totalUp = feedbacks.filter(f => f.type === 'up').length;
  const totalDown = feedbacks.filter(f => f.type === 'down').length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
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
        {/* Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, #CC0000, #8B0000)',
          padding: '20px 24px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>📊 Store Manager Dashboard</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Bata AI Assistant Analytics</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Queries', value: data.totalQueries, icon: '📈', color: '#CC0000' },
              { label: "Today's Queries", value: data.todayQueries, icon: '📅', color: '#2563eb' },
              { label: 'Positive Feedback', value: totalUp, icon: '👍', color: '#059669' },
              { label: 'Needs Improvement', value: totalDown, icon: '👎', color: '#eab308' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#f8f8f8',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                border: '1px solid #eee',
              }}>
                <div style={{ fontSize: 24 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, marginTop: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {data.totalQueries === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No data yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Analytics will appear here once customers start chatting.</div>
            </div>
          ) : (
            <>
              {/* Daily Trend */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#333' }}>📈 7-Day Trend</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '0 4px' }}>
                  {data.dailyTrend.map(d => (
                    <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        background: 'linear-gradient(180deg, #CC0000, #ff4444)',
                        borderRadius: '4px 4px 0 0',
                        height: Math.max((d.count / maxDailyCount) * 70, 4),
                        transition: 'height 0.3s',
                        margin: '0 auto',
                        width: '70%',
                      }} />
                      <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>{d.date}</div>
                      <div style={{ fontSize: 10, color: '#CC0000', fontWeight: 700 }}>{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-column layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Top Queries */}
                <div style={{ background: '#fafafa', borderRadius: 12, padding: 14, border: '1px solid #eee' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#333' }}>🔍 Top Queries</div>
                  {data.topQueries.slice(0, 7).map((q, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: 12,
                    }}>
                      <span style={{ color: '#555', maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i + 1}. {q.query}
                      </span>
                      <span style={{ color: '#CC0000', fontWeight: 700 }}>{q.count}×</span>
                    </div>
                  ))}
                </div>

                {/* Top Products */}
                <div style={{ background: '#fafafa', borderRadius: 12, padding: 14, border: '1px solid #eee' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#333' }}>👟 Most Searched Products</div>
                  {data.topProducts.slice(0, 7).map((p, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: 12,
                    }}>
                      <span style={{ color: '#555', maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i + 1}. {p.name}
                      </span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{p.count}×</span>
                    </div>
                  ))}
                  {data.topProducts.length === 0 && <div style={{ color: '#aaa', fontSize: 12 }}>No product data yet</div>}
                </div>
              </div>

              {/* Peak Hours */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#333' }}>🕐 Peak Hours</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
                  {data.peakHours.map(h => (
                    <div key={h.hour} style={{
                      flex: 1,
                      background: h.count > 0 ? `rgba(204,0,0,${0.2 + (h.count / maxHourCount) * 0.8})` : '#f0f0f0',
                      height: h.count > 0 ? Math.max((h.count / maxHourCount) * 50, 4) : 4,
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s',
                      cursor: 'default',
                      title: `${h.hour}:00 — ${h.count} queries`,
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#aaa', marginTop: 2 }}>
                  <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
                </div>
              </div>

              {/* Query Types */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#333' }}>🎯 Query Categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.queryTypes.map(t => (
                    <div key={t.type} style={{
                      background: '#fff5f5',
                      border: '1px solid #ffd6d6',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 12,
                      color: '#CC0000',
                      fontWeight: 600,
                    }}>
                      {t.type.replace('_', ' ')} ({t.count})
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Queries */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#333' }}>🕑 Recent Queries</div>
                <div style={{ maxHeight: 150, overflowY: 'auto', borderRadius: 8, border: '1px solid #eee' }}>
                  {data.recentQueries.slice(0, 10).map((q, i) => (
                    <div key={i} style={{
                      padding: '6px 12px',
                      borderBottom: '1px solid #f5f5f5',
                      fontSize: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: i % 2 === 0 ? '#fafafa' : '#fff',
                    }}>
                      <span style={{ color: '#555' }}>{q.query}</span>
                      <span style={{ color: '#aaa', fontSize: 10, whiteSpace: 'nowrap', marginLeft: 8 }}>
                        {new Date(q.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Export Button */}
          <button
            onClick={exportAnalytics}
            style={{
              background: 'linear-gradient(135deg, #CC0000, #a00000)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 12,
              color: '#fff',
              cursor: 'pointer',
              marginRight: 8,
              fontWeight: 600,
            }}
          >
            📤 Export JSON
          </button>
          {/* Clear Data Button */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={async () => {
                if (confirm('Clear all analytics data? This cannot be undone.')) {
                  await clearAnalytics()
                  const result = await getAnalytics()
                  setData(result)
                }
              }}
              style={{
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 12,
                color: '#888',
                cursor: 'pointer',
              }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
