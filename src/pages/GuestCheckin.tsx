import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getShelterById } from '../data/shelters'
import { useStore } from '../data/store'
import Button from '../components/Button'
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

export default function GuestCheckin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, addCheckin } = useStore()
  const [guestName, setGuestName] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [people, setPeople] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const shelter = id ? getShelterById(id) : undefined

  if (!shelter) {
    return (
      <div style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h1>מקלט לא נמצא</h1>
        <Button onClick={() => navigate('/report')} style={{ marginTop: '16px' }}>חזרה למקלטים</Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '64px' }}>✅</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 , textAlign: 'center'}}>האורח נרשם בהצלחה!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' , textAlign: 'center'}}>
          {guestName} — {shelter.name} — {people} {people === 1 ? 'אדם' : 'אנשים'}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="lg" onClick={() => {
            setGuestName('')
            setHouseNumber('')
            setPeople(1)
            setSubmitted(false)
          }}>
            רישום אורח נוסף
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate(`/shelter/${shelter.id}`)}>
            חזרה למקלט
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    if (!guestName.trim()) return
    addCheckin({
      id: 'guest-' + Date.now(),
      shelterId: shelter.id,
      userId: 'guest-' + Date.now(),
      userName: guestName.trim(),
      userPhone: '',
      userHouseNumber: houseNumber.trim(),
      peopleCount: people,
      timestamp: Date.now(),
      isGuest: true,
      registeredBy: currentUser?.fullName ?? 'מנהל',
    })
    setSubmitted(true)
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
      padding: '68px 24px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <BackButton />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' , textAlign: 'center'}}>
            רישום אורח
          </h1>
          <p style={{ color: 'var(--color-accent)', fontSize: '14px', fontWeight: 600 , textAlign: 'center'}}>
            {shelter.name} — מקלט {shelter.number}
          </p>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSubmit() }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{
              display: 'block', fontSize: '14px', fontWeight: 600,
              marginBottom: '6px', color: 'var(--color-text-secondary)',
            }}>
              שם מלא של האורח
            </label>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="שם מלא"
              autoFocus
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '14px', fontWeight: 600,
              marginBottom: '6px', color: 'var(--color-text-secondary)',
            }}>
              מספר בית (לא חובה)
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              placeholder="מספר בית"
              dir="ltr"
              style={{ ...inputStyle, maxWidth: '140px' }}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '14px', fontWeight: 600,
              marginBottom: '12px', color: 'var(--color-text-secondary)',
              textAlign: 'center',
            }}>
              מספר אנשים
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setPeople(Math.max(1, people - 1))}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '22px', cursor: 'pointer',
                }}>−</button>
              <span style={{ fontSize: '36px', fontWeight: 800, minWidth: '48px', textAlign: 'center' }}>
                {people}
              </span>
              <button type="button" onClick={() => setPeople(people + 1)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)', fontSize: '22px', cursor: 'pointer',
                }}>+</button>
            </div>
          </div>

          <Button
            size="lg"
            type="submit"
            disabled={!guestName.trim()}
            style={{ width: '100%', marginTop: '8px', opacity: guestName.trim() ? 1 : 0.5 }}
          >
            רשום אורח
          </Button>
        </form>

        <button
          onClick={() => navigate(`/shelter/${shelter.id}`)}
          style={{
            display: 'block', width: '100%', marginTop: '14px',
            background: 'none', border: 'none', color: 'var(--color-text-secondary)',
            fontSize: '13px', cursor: 'pointer', textAlign: 'center',
          }}
        >
          חזרה למקלט
        </button>
      </div>
    </div>
  )
}
