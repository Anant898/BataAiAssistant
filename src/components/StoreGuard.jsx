import { useState, useEffect } from 'react'

// Bata Store Connaught Place, New Delhi (Demo Coordinates)
const BATA_STORE_LAT = 28.631451
const BATA_STORE_LON = 77.216667
const MAX_DISTANCE_METERS = 100 // 100 meters radius

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in m
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

function StoreGuard({ children }) {
  const [status, setStatus] = useState('scanning') // 'scanning', 'granted', 'denied', 'error'
  const [distance, setDistance] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    if (devMode) {
      setStatus('granted')
      return
    }

    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMessage('Geolocation is not supported by your browser.')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLon = position.coords.longitude
        const dist = getDistanceFromLatLonInM(userLat, userLon, BATA_STORE_LAT, BATA_STORE_LON)
        setDistance(Math.round(dist))

        if (dist <= MAX_DISTANCE_METERS) {
          setStatus('granted')
        } else {
          setStatus('denied')
        }
      },
      (error) => {
        setStatus('error')
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Please allow location access to use the Bata In-Store AI.')
        } else {
          setErrorMessage('Unable to retrieve your location.')
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [devMode])

  // Dev Override Secret (Clicking the logo 5 times)
  const [clickCount, setClickCount] = useState(0)
  const handleSecretClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    if (newCount >= 5) {
      setDevMode(true)
    }
  }

  if (status === 'granted') {
    return children
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#f7f7f7', fontFamily: 'Inter, sans-serif', padding: 20, textAlign: 'center'
    }}>
      <div 
        onClick={handleSecretClick}
        style={{
        width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #CC0000, #a00000)',
        color: '#fff', fontSize: 36, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 10px 20px rgba(204,0,0,0.2)', cursor: 'default'
      }}>
        B
      </div>

      {status === 'scanning' && (
        <>
          <div style={{
            width: 60, height: 60, border: '4px solid #e0e0e0', borderTop: '4px solid #CC0000',
            borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20
          }} />
          <h2 style={{ color: '#1a1a1a', margin: '0 0 8px 0' }}>Verifying Store Location</h2>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>Please ensure your GPS is turned on...</p>
        </>
      )}

      {status === 'denied' && (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
          <h2 style={{ color: '#1a1a1a', margin: '0 0 8px 0' }}>Out of Store Range</h2>
          <p style={{ color: '#555', margin: '0 0 16px 0', fontSize: 15, lineHeight: 1.5 }}>
            This Bata AI Assistant is exclusive to our physical stores.
          </p>
          <div style={{ background: '#fff', padding: '12px 20px', borderRadius: 12, border: '1px solid #eee', color: '#888', fontSize: 13 }}>
            You are currently <strong style={{color: '#CC0000'}}>{(distance / 1000).toFixed(1)} km</strong> away from the Connaught Place store.
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#1a1a1a', margin: '0 0 8px 0' }}>Location Required</h2>
          <p style={{ color: '#CC0000', margin: '0 0 16px 0', fontSize: 14, fontWeight: 600 }}>{errorMessage}</p>
          <p style={{ color: '#555', margin: 0, fontSize: 14 }}>
            We need your location to verify you are inside a Bata store.
          </p>
        </>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default StoreGuard
