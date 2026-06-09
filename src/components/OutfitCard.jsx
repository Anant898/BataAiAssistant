function OutfitCard({ outfit }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff5f5 0%, #fef3e8 50%, #fff9f0 100%)',
      border: '1px solid #ffd6d6',
      borderRadius: 14,
      padding: '16px 18px',
      marginTop: 10,
      boxShadow: '0 2px 8px rgba(204,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          background: '#CC0000',
          color: '#fff',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          👔 Complete Look
        </div>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#1a1a1a',
          flex: 1,
        }}>
          {outfit.title}
        </div>
      </div>

      {/* Items */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
      }}>
        {outfit.items?.map((item, i) => (
          // ✅ Issue #9 Fix — stable key: id prefer karo, phir name+type, phir index
          <div key={item.id ? item.id : `${item.type}-${item.name}-${i}`} style={{
            background: '#fff',
            border: '1px solid #f0e8e0',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '1 1 auto',
            minWidth: 140,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: item.type === 'shoe' ? '#CC0000' : '#f5a623',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#fff',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {item.type === 'shoe' ? '👟' : '✦'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>
                {item.name}
              </div>
              <div style={{
                fontSize: 10,
                color: '#888',
                textTransform: 'capitalize',
                marginTop: 1,
              }}>
                {item.type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Occasion */}
      {outfit.occasion && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 12, color: '#888' }}>📍</span>
          <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>
            {outfit.occasion}
          </span>
        </div>
      )}

      {/* Style Tip */}
      {outfit.styleTip && (
        <div style={{
          background: '#fff',
          borderLeft: '3px solid #f5a623',
          padding: '8px 12px',
          borderRadius: '0 8px 8px 0',
          fontSize: 12,
          color: '#555',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          💡 {outfit.styleTip}
        </div>
      )}
    </div>
  )
}

export default OutfitCard