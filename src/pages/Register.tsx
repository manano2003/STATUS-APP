import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'
import Button from '../components/Button'
import { useStore } from '../data/store'

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
  const { addUser, setCurrentUser } = useStore()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [residents, setResidents] = useState(1)

  const isValid = fullName.trim() && phone.trim() && city.trim() && street.trim() && houseNumber.trim()

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
          <h1 style={{ fontSize: '22px', fontWeight: 800 , textAlign: 'center'}}>השלמת פרטים אישיים</h1>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!isValid) return
            const user = {
              id: Date.now().toString(),
              email: '',
              fullName: fullName.trim(),
              phone: phone.trim(),
              city: city.trim(),
              street: street.trim(),
              houseNumber: houseNumber.trim(),
              residents,
              roles: ['USR'],
            }
            addUser(user)
            setCurrentUser(user)
            navigate('/report')
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
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
                972+
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

          <Button
            size="lg"
            type="submit"
            disabled={!isValid}
            style={{ width: '100%', marginTop: '8px', opacity: isValid ? 1 : 0.5 }}
          >
            סיום הרשמה
          </Button>
        </form>
      </div>
    </div>
  )
}
