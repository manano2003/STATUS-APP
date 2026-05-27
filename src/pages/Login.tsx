import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'
import Button from '../components/Button'
import { useStore } from '../data/store'
import { supabase } from '../data/supabase'

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

type Step = 'login' | 'reset' | 'success'

export default function Login() {
  const navigate = useNavigate()
  const { setCurrentUser } = useStore()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newPinConfirm, setNewPinConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showNewPinConfirm, setShowNewPinConfirm] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('login')

  const pinMatch = newPin.length >= 6 && /\d/.test(newPin) && /[a-zA-Zא-ת]/.test(newPin) && /[^a-zA-Zא-ת0-9\s]/.test(newPin) && newPin === newPinConfirm

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // First check if this email needs pin reset
    const { data: resetCheck } = await supabase.rpc('check_pin_reset', { user_email: email.trim().toLowerCase() })
    if (resetCheck?.needs_reset) {
      setStep('reset')
      return
    }
    if (!resetCheck?.exists) {
      setError('המייל לא נמצא במערכת')
      return
    }

    const { data, error: rpcError } = await supabase.rpc('verify_pin', { user_email: email.trim().toLowerCase(), user_pin: pin })
    if (rpcError || !data?.success) {
      if (data?.error === 'locked') {
        setError(`החשבון ננעל ל-${data.minutes} דקות עקב ניסיונות כושלים`)
      } else if (data?.error === 'user_not_found') {
        setError('המייל לא נמצא במערכת')
      } else {
        setError('הקוד שגוי')
      }
      return
    }
    const u = data.user
    const user = {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      phone: u.phone,
      city: u.city,
      street: u.street,
      houseNumber: u.house_number,
      residents: u.residents,
      roles: u.roles,
      isGuest: u.is_guest,
    }
    setCurrentUser(user)
    navigate(user.roles.includes('ADMIN') ? '/communities' : '/report')
  }

  const handleSetNewPin = async () => {
    setError('')
    if (!pinMatch) return
    const { data } = await supabase.rpc('set_new_pin', { user_email: email.trim().toLowerCase(), new_pin: newPin })
    if (data?.success) {
      setStep('success')
    } else {
      setError('שגיאה בשינוי הסיסמה')
    }
  }

  const handleEnterAfterReset = async () => {
    const { data } = await supabase.rpc('verify_pin', { user_email: email.trim().toLowerCase(), user_pin: newPin })
    if (data?.success) {
      const u = data.user
      setCurrentUser({
        id: u.id, email: u.email, fullName: u.full_name, phone: u.phone,
        city: u.city, street: u.street, houseNumber: u.house_number,
        residents: u.residents, roles: u.roles, isGuest: u.is_guest,
      })
      navigate(u.roles.includes('ADMIN') ? '/communities' : '/report')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logo} alt="STATUS" style={{ width: '160px', borderRadius: '12px', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center' }}>
            {step === 'login' ? 'כניסה למערכת' : step === 'reset' ? 'בחירת סיסמה חדשה' : 'הסיסמה שונתה בהצלחה!'}
          </h1>
        </div>

        {step === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>אימייל</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="name@example.com" dir="ltr" autoFocus autoComplete="off" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>קוד אישי</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px' }}>
                <input type={showPin ? 'text' : 'password'} value={pin}
                  onChange={e => { setPin(e.target.value); setError('') }}
                  placeholder="הקלד קוד" dir="ltr" autoComplete="off" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'} />
                <button type="button" onClick={() => setShowPin(!showPin)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', opacity: 1, flexShrink: 0, color: 'var(--color-accent)',
                }}><span style={{ textDecoration: showPin ? 'line-through' : 'none' }}>👁</span></button>
              </div>
            </div>
            {error && <p style={{ color: 'var(--color-danger)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
            <Button size="lg" type="submit" style={{ width: '100%', marginTop: '8px' }}>כניסה</Button>
            <button type="button" onClick={() => navigate('/welcome')} style={{
              background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', textAlign: 'center', marginTop: '4px',
            }}>חזרה</button>
          </form>
        )}

        {step === 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              הסיסמה שלך אופסה. בחר/י סיסמה חדשה (מינימום 6 תווים, ספרות + אותיות + סמל)
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>סיסמה חדשה</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px' }}>
                <input type={showNewPin ? 'text' : 'password'} value={newPin}
                  onChange={e => setNewPin(e.target.value)} placeholder="סיסמה חדשה" dir="ltr"
                  autoComplete="new-password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'} />
                <button type="button" onClick={() => setShowNewPin(!showNewPin)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', opacity: 1, flexShrink: 0, color: 'var(--color-accent)',
                }}><span style={{ textDecoration: showNewPin ? 'line-through' : 'none' }}>👁</span></button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>הקלד שוב לאימות</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px' }}>
                <input type={showNewPinConfirm ? 'text' : 'password'} value={newPinConfirm}
                  onChange={e => setNewPinConfirm(e.target.value)} placeholder="הקלד שוב" dir="ltr"
                  autoComplete="new-password"
                  style={{ ...inputStyle, borderColor: newPinConfirm && !pinMatch ? 'var(--color-danger)' : undefined }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'} />
                <button type="button" onClick={() => setShowNewPinConfirm(!showNewPinConfirm)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', opacity: 1, flexShrink: 0, color: 'var(--color-accent)',
                }}><span style={{ textDecoration: showNewPinConfirm ? 'line-through' : 'none' }}>👁</span></button>
              </div>
              {newPinConfirm && !pinMatch && (
                <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>הקודים לא תואמים</p>
              )}
            </div>
            {error && <p style={{ color: 'var(--color-danger)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
            <Button size="lg" disabled={!pinMatch} onClick={handleSetNewPin}
              style={{ width: '100%', marginTop: '8px', opacity: pinMatch ? 1 : 0.5 }}>
              שמור סיסמה חדשה
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✓</p>
            <p style={{ fontSize: '16px', color: 'var(--color-success)', fontWeight: 700, marginBottom: '24px' }}>
              הסיסמה שונתה בהצלחה
            </p>
            <Button size="lg" onClick={handleEnterAfterReset} style={{ width: '100%' }}>
              כניסה למערכת
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
