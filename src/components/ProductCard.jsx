import { useState } from 'react'

// ✅ Wishlist helpers — localStorage, zero tokens
export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('bata_wishlist') || '[]')
  } catch { return [] }
}

export function toggleWishlist(product) {
  const list = getWishlist()
  const exists = list.find(p => p.id === product.id)
  const updated = exists
    ? list.filter(p => p.id !== product.id)
    : [...list, { ...product, savedAt: new Date().toISOString() }]
  localStorage.setItem('bata_wishlist', JSON.stringify(updated))
  return !exists
}

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(
    () => getWishlist().some(p => p.id === product.id)
  )

  const handleWishlist = () => {
    const added = toggleWishlist(product)
    setWishlisted(added)
  }

  const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 12,
      padding: '14px 16px',
      marginTop: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 220,
      maxWidth: 280,
    }}>

      {/* ID + Stars + Wishlist */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          background: '#fff5f5',
          border: '1px solid #ffd6d6',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 11,
          color: '#CC0000',
          fontWeight: 600,
          letterSpacing: 0.3
        }}>
          {product.id}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#f5a623' }}>{stars}</div>
          <button
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            style={{
              background: wishlisted ? '#fff5f5' : '#f5f5f5',
              border: wishlisted ? '1px solid #ffd6d6' : '1px solid #e0e0e0',
              borderRadius: '50%',
              width: 28,
              height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {product.image && (
        <div style={{
          width: '100%',
          height: 160,
          overflow: 'hidden',
          borderRadius: 8,
          marginTop: 12,
          background: '#f9f9f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #eee'
        }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}

      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 15, color: '#1a1a1a', lineHeight: 1.3 }}>
        {product.name}
      </div>

      <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: '#CC0000' }}>
        ₹{product.price.toLocaleString()}
      </div>

      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={tagStyle}>{product.color}</span>
        <span style={tagStyle}>{product.material}</span>
        <span style={{
          ...tagStyle,
          background: product.inStock ? '#f0faf4' : '#fff5f5',
          color: product.inStock ? '#1a7a3a' : '#CC0000',
          border: `1px solid ${product.inStock ? '#b8e8c8' : '#ffd6d6'}`
        }}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {product.sizes && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Available sizes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {product.sizes.map(s => (
              <span key={s} style={{
                fontSize: 11,
                padding: '2px 7px',
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                color: '#444',
                background: '#fafafa'
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {product.reason && (
        <div style={{
          marginTop: 10,
          fontSize: 12,
          color: '#555',
          background: '#fafafa',
          borderLeft: '3px solid #CC0000',
          padding: '6px 10px',
          borderRadius: '0 6px 6px 0',
          lineHeight: 1.5
        }}>
          {product.reason}
        </div>
      )}
    </div>
  )
}

function AccessoryCard({ accessory }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 10,
      padding: '10px 14px',
      marginTop: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {accessory.image ? (
  <div style={{
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid #eee',
  }}>
    <img
      src={accessory.image}
      alt={accessory.name}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>
) : (
  <div style={{
    width: 36,
    height: 36,
    borderRadius: 8,
    background: '#fff5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0
  }}>+</div>
)}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{accessory.name}</div>
        {accessory.reason && (
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{accessory.reason}</div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#CC0000', flexShrink: 0 }}>
        ₹{accessory.price}
      </div>
    </div>
  )
}

function ComboCard({ combo }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff5f5 0%, #fff9f0 100%)',
      border: '1px solid #ffd6d6',
      borderRadius: 10,
      padding: '12px 14px',
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      {/* ✅ Image ya discount badge */}
      {combo.image ? (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid #ffd6d6',
        }}>
          <img
            src={combo.image}
            alt={combo.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          background: '#CC0000',
          color: '#fff',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0
        }}>
          {combo.discount}% OFF
        </div>
      )}

      <div style={{ flex: 1 }}>
        {/* ✅ Discount badge text ke saath show karo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            background: '#CC0000',
            color: '#fff',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 700,
          }}>{combo.discount}% OFF</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{combo.name}</div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{combo.description}</div>
        <div style={{ fontSize: 11, color: '#CC0000', marginTop: 2, fontWeight: 500 }}>{combo.totalSaving}</div>
      </div>
    </div>
  )
}
const tagStyle = {
  fontSize: 11,
  padding: '2px 8px',
  background: '#f5f5f5',
  border: '1px solid #e8e8e8',
  borderRadius: 20,
  color: '#555'
}

export { ProductCard, AccessoryCard, ComboCard }