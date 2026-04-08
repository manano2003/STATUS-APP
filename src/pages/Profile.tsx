import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import Button from '../components/Button'
import logo from '../assets/logo.jpeg'
import BackButton from '../components/BackButton'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text)',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '6px',
  color: 'var(--color-text-secondary)',
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser, users } = useStore()

  const [fullName, setFullName] = useState(currentUser?.fullName ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [city, setCity] = useState(currentUser?.city ?? '')
  const [street, setStreet] = useState(currentUser?.street ?? '')
  const [houseNumber, setHouseNumber] = useState(currentUser?.houseNumber ?? '')
  const [residents, setResidents] = useState(currentUser?.residents ?? 1)
  const [saved, setSaved] = useState(false)

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleSave = () => {
    const updated = { ...currentUser, fullName, phone, city, street, houseNumber, residents }
    setCurrentUser(updated)
    const idx = users.findIndex(u => u.id === currentUser.id)
    if (idx >= 0) users[idx] = updated
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-accent)'
  }
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '72px 24px 24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        padding: '32px 24px',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <BackButton />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src={logo} alt="STATUS" style={{ width: '80px', borderRadius: '10px', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 800 , textAlign: 'center'}}>אזור אישי</h1>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSave() }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={labelStyle}>שם מלא</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>

          <div>
            <label style={labelStyle}>מספר טלפון</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'ltr' }}>
              <span style={{
                padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)', color: 'var(--color-accent)', fontSize: '16px', fontWeight: 700,
              }}>972+</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                dir="ltr" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>ישוב</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)}
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>

          <div>
            <label style={labelStyle}>רחוב</label>
            <input type="text" value={street} onChange={e => setStreet(e.target.value)}
              style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>

          <div>
            <label style={labelStyle}>מספר בית</label>
            <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)}
              dir="ltr" style={{ ...inputStyle, maxWidth: '120px' }} onFocus={focusHandler} onBlur={blurHandler} />
          </div>

          <div>
            <label style={labelStyle}>מספר נפשות בבית</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button type="button" onClick={() => setResidents(Math.max(1, residents - 1))}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer',
                }}>−</button>
              <span style={{ fontSize: '24px', fontWeight: 800, minWidth: '32px', textAlign: 'center' }}>{residents}</span>
              <button type="button" onClick={() => setResidents(residents + 1)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer',
                }}>+</button>
            </div>
          </div>

          <Button size="lg" type="submit" style={{ width: '100%', marginTop: '4px' }}>
            {saved ? '✓ נשמר בהצלחה' : 'שמור שינויים'}
          </Button>
        </form>

        <button
          onClick={() => { setCurrentUser(null); navigate('/login') }}
          style={{
            display: 'block', width: '100%', marginTop: '16px', padding: '12px',
            background: 'none', border: '1px solid rgba(232, 77, 77, 0.3)', borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          התנתקות
        </button>
      </div>
    </div>
  )
}
