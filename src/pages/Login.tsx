import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'
import Button from '../components/Button'

type Step = 'email' | 'code'

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

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isCodeComplete = code.every(d => d !== '')

  const handleCodeChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newCode = [...code]
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d
      })
      setCode(newCode)
      const nextIndex = Math.min(index + digits.length, 5)
      codeRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d?$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }, [code])

  const handleCodeKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
    }
  }, [code])

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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={logo}
            alt="STATUS"
            style={{ width: '160px', borderRadius: '12px', margin: '0 auto 20px' }}
          />
        </div>

        {step === 'email' && (
          <form onSubmit={e => { e.preventDefault(); if (isEmailValid) setStep('code') }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '14px', fontWeight: 600,
                marginBottom: '6px', color: 'var(--color-text-secondary)',
              }}>
                אימייל אישי
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(77, 166, 232, 0.2)'}
              />
            </div>

            {isEmailValid && (
              <Button size="lg" style={{ width: '100%' }} type="submit">
                קבל קוד
              </Button>
            )}
          </form>
        )}

        {step === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' , textAlign: 'center'}}>
                הקוד נשלח ל-
              </p>
              <p style={{ color: 'var(--color-accent)', fontSize: '16px', fontWeight: 600, direction: 'ltr' , textAlign: 'center'}}>
                {email}
              </p>
            </div>

            {/* 6-digit code input */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              direction: 'ltr',
            }}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { codeRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-sm)',
                    border: digit
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    caretColor: 'var(--color-accent)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => {
                    e.target.style.borderColor = digit
                      ? 'var(--color-accent)'
                      : 'rgba(77, 166, 232, 0.2)'
                  }}
                />
              ))}
            </div>

            {isCodeComplete && (
              <Button
                size="lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/register')}
              >
                כנס למערכת
              </Button>
            )}

            <button
              onClick={() => { setStep('email'); setCode(Array(6).fill('')) }}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-secondary)',
                fontSize: '13px', cursor: 'pointer', textAlign: 'center',
              }}
            >
              שלח קוד שוב / שנה אימייל
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
