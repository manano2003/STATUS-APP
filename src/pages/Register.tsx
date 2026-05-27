import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '6px',
  color: 'var(--color-text-secondary)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { users, addUser, updateUser, setCurrentUser } = useStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [residents, setResidents] = useState(1)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showPinConfirm, setShowPinConfirm] = useState(false)
  const [userType, setUserType] = useState<'resident' | 'guest'>('resident')
  const [matchedUser, setMatchedUser] = useState<typeof users[0] | null>(null)
  const [matchMessage, setMatchMessage] = useState('')
  const [rateLimited, setRateLimited] = useState(false)
  const returnTo = searchParams.get('returnTo') || ''

  // Check for existing user when phone changes
  useEffect(() => {
    if (phone.length >= 9) {
      const found = users.find(u => u.phone === phone)
      if (found) {
        setMatchedUser(found)
        setMatchMessage(`מצאנו אותך! ${found.fullName}`)
        setFullName(found.fullName)
        if (found.email) setEmail(found.email)
        if (found.city) setCity(found.city)
        if (found.street) setStreet(found.street)
        if (found.houseNumber) setHouseNumber(found.houseNumber)
        if (found.residents > 1) setResidents(found.residents)
      } else {
        setMatchedUser(null)
        setMatchMessage('')
      }
    } else {
      setMatchedUser(null)
      setMatchMessage('')
    }
  }, [phone, users])

  const pinMatch = pin.length >= 6 && /\d/.test(pin) && /[a-zA-Zא-ת]/.test(pin) && /[^a-zA-Zא-ת0-9\s]/.test(pin) && pin === pinConfirm
  const isValid = fullName.trim() && phone.trim() && city.trim() && houseNumber.trim() && pinMatch

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-accent)'
  }
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const isAdmin = matchedUser?.roles.includes('ADMIN')
    const destination = returnTo || (isAdmin ? '/communities' : '/report')

    if (matchedUser) {
      const updatedUser = {
        ...matchedUser,
        email: email.trim() || matchedUser.email,
        fullName: fullName.trim(),
        city: city.trim(),
        street: street.trim(),
        houseNumber: houseNumber.trim(),
        residents,
        pin,
        isGuest: userType === 'guest',
      }
      updateUser(updatedUser)
      setCurrentUser(updatedUser)
      navigate(destination)
    } else {
      // Rate-limited registration via secure RPC
      const { data } = await supabase.rpc('secure_register', {
        p_email: email.trim(),
        p_full_name: fullName.trim(),
        p_phone: phone.trim(),
        p_city: city.trim(),
        p_street: street.trim(),
        p_house_number: houseNumber.trim(),
        p_residents: residents,
        p_roles: ['USR'],
        p_pin: pin,
        p_is_guest: userType === 'guest',
      })
      if (data?.success === false) {
        if (data.error === 'rate_limit') {
          setRateLimited(true)
          return
        }
        console.error('Registration failed:', data.error)
        return
      }
      if (data?.user) {
        const appUser = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          phone: data.user.phone,
          city: data.user.city,
          street: data.user.street,
          houseNumber: data.user.house_number,
          residents: data.user.residents,
          roles: data.user.roles,
          pin: undefined,
          isGuest: data.user.is_guest,
        }
        setCurrentUser(appUser)
        navigate(destination)
      } else {
        // Fallback if RPC returns unexpected format
        const user = {
          id: Date.now().toString(),
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          street: street.trim(),
          houseNumber: houseNumber.trim(),
          residents,
          roles: ['USR'],
          pin,
          isGuest: userType === 'guest',
        }
        const saved = await addUser(user)
        setCurrentUser(saved || user)
        navigate(destination)
      }
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
        maxWidth: '440px',
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src={logo}
            alt="STATUS"
            style={{ width: '120px', borderRadius: '12px', margin: '0 auto 16px' }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center' }}>השלמת פרטים אישיים</h1>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="סוג משתמש">
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setUserType('resident')}
                style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${userType === 'resident' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: userType === 'resident' ? 'rgba(77, 166, 232, 0.15)' : 'transparent',
                  color: userType === 'resident' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                תושב/ת
              </button>
              <button
                type="button"
                onClick={() => setUserType('guest')}
                style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${userType === 'guest' ? 'var(--color-warning)' : 'var(--color-border)'}`,
                  background: userType === 'guest' ? 'rgba(232, 197, 77, 0.15)' : 'transparent',
                  color: userType === 'guest' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                אורח/ת
              </button>
            </div>
          </Field>

          <Field label="שם מלא">
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="ישראל ישראלי"
              autoFocus
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </Field>

          <Field label="מספר טלפון">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'ltr' }}>
              <span style={{
                padding: '12px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-accent)',
                fontSize: '16px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                +972
              </span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="501234567"
                dir="ltr"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </Field>

          {matchMessage && (
            <div style={{
              background: 'rgba(77, 232, 138, 0.1)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-success)',
              textAlign: 'center',
            }}>
              {matchMessage}
            </div>
          )}

          <Field label="אימייל">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
              dir="ltr"
              autoComplete="off"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </Field>

          <Field label="ישוב">
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="שם הישוב"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </Field>

          <Field label="רחוב">
            <input
              type="text"
              value={street}
              onChange={e => setStreet(e.target.value)}
              placeholder="שם הרחוב"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </Field>

          <Field label="מספר בית">
            <input
              type="text"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              placeholder="12"
              dir="ltr"
              autoComplete="off"
              style={{ ...inputStyle, maxWidth: '120px' }}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </Field>

          <Field label="מספר נפשות בבית">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setResidents(Math.max(1, residents - 1))}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '20px', cursor: 'pointer',
                }}
              >
                −
              </button>
              <span style={{ fontSize: '28px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>
                {residents}
              </span>
              <button
                type="button"
                onClick={() => setResidents(residents + 1)}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '20px', cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </Field>

          <Field label="בחר קוד אישי (מינימום 6 תווים, ספרות + אותיות + סמל)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px' }}>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="קוד אישי"
                dir="ltr"
                autoComplete="new-password"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
              <button type="button" onClick={() => setShowPin(!showPin)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', opacity: 1, flexShrink: 0, color: 'var(--color-accent)',
              }}><span style={{ textDecoration: showPin ? 'line-through' : 'none' }}>👁</span></button>
            </div>
          </Field>

          <Field label="הקלד שוב לאימות">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px' }}>
              <input
                type={showPinConfirm ? 'text' : 'password'}
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value)}
                placeholder="הקלד שוב"
                dir="ltr"
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  borderColor: pinConfirm && !pinMatch ? 'var(--color-danger)' : undefined,
                }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
              <button type="button" onClick={() => setShowPinConfirm(!showPinConfirm)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', opacity: 1, flexShrink: 0, color: 'var(--color-accent)',
              }}><span style={{ textDecoration: showPinConfirm ? 'line-through' : 'none' }}>👁</span></button>
            </div>
            {pinConfirm && !pinMatch && (
              <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                הקודים לא תואמים
              </p>
            )}
          </Field>

          {rateLimited && (
            <div style={{
              background: 'rgba(232, 77, 77, 0.1)',
              border: '1px solid rgba(232, 77, 77, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '14px',
              color: 'var(--color-danger)',
              textAlign: 'center',
            }}>
              יותר מדי הרשמות. נסה שוב מאוחר יותר.
            </div>
          )}

          <Button
            size="lg"
            type="submit"
            disabled={!isValid || rateLimited}
            style={{ width: '100%', marginTop: '8px', opacity: (isValid && !rateLimited) ? 1 : 0.5 }}
          >
            סיום הרשמה
          </Button>
        </form>
      </div>
    </div>
  )
}
