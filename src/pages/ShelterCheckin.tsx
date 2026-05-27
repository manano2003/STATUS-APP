import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getShelterById, getTrafficLight } from '../data/shelters'
import { useStore } from '../data/store'
import { getSourceKindergartens, getSourceClubs } from '../data/sourceData'
import Button from '../components/Button'
import BackButton from '../components/BackButton'

const MAX_CAPACITY = 50

export default function ShelterCheckin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, addCheckin, getUserCheckin, getShelterPeopleCount, getKindergartenAttendance, getClubAttendance } = useStore()
  const [people, setPeople] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [showFrameworkPopup, setShowFrameworkPopup] = useState(false)
  const [frameworkSubmitted, setFrameworkSubmitted] = useState<{ name: string; count: number } | null>(null)

  const shelter = id ? getShelterById(id) : undefined
  const existingCheckin = currentUser ? getUserCheckin(currentUser.id) : undefined

  // If not logged in, redirect to register with return URL
  if (!currentUser && shelter) {
    navigate(`/register?returnTo=/shelter/${id}`, { replace: true })
    return null
  }

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
        <h1 style={{ fontSize: '24px', fontWeight: 800 , textAlign: 'center'}}>נרשמת בהצלחה!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' , textAlign: 'center'}}>
          {shelter.name} — {people} {people === 1 ? 'אדם' : 'אנשים'}
        </p>
        {existingCheckin && existingCheckin.shelterId !== shelter.id && (
          <p style={{ color: 'var(--color-warning)', fontSize: '14px' }}>
            הרישום הקודם שלך בוטל ועודכן למקלט זה
          </p>
        )}
        <Button size="lg" onClick={() => navigate('/report')} style={{ marginTop: '16px' }}>
          חזרה למקלטים
        </Button>
      </div>
    )
  }

  const handleSubmit = () => {
    addCheckin({
      id: Date.now().toString(),
      shelterId: shelter.id,
      userId: currentUser?.id ?? 'anonymous-' + Date.now(),
      userName: currentUser?.fullName ?? 'אורח',
      userPhone: currentUser?.phone ?? '',
      userHouseNumber: currentUser?.houseNumber ?? '',
      peopleCount: people,
      timestamp: Date.now(),
    })
    setSubmitted(true)
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
        <BackButton to="/report" />

        {/* Shelter Image */}
        <div style={{
          width: '100%',
          height: '180px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '20px',
          marginTop: '40px',
        }}>
          <img
            src={shelter.imageUrl}
            alt={shelter.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Progress bar */}
        {(() => {
          const count = getShelterPeopleCount(shelter.id)
          const traffic = getTrafficLight(count)
          const barPercent = Math.min((count / MAX_CAPACITY) * 100, 100)
          return (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '6px', fontSize: '12px',
              }}>
                <span style={{ color: traffic.color, fontWeight: 700 }}>{traffic.label}</span>
                <span style={{ color: traffic.color, fontWeight: 800 }}>{count} נפשות</span>
              </div>
              <div style={{
                width: '100%', height: '8px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${barPercent}%`, height: '100%', borderRadius: '4px',
                  background: traffic.color,
                  opacity: 0.3 + (barPercent / 100) * 0.7,
                  transition: 'width 0.3s ease, opacity 0.3s ease',
                }} />
              </div>
            </div>
          )
        })()}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' , textAlign: 'center'}}>
            {shelter.name}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' , textAlign: 'center'}}>
            מקלט {shelter.number}
          </p>
        </div>

        {/* Warning if already checked in elsewhere */}
        {existingCheckin && existingCheckin.shelterId !== shelter.id && (
          <div style={{
            background: 'rgba(232, 77, 77, 0.1)',
            border: '1px solid rgba(232, 77, 77, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--color-danger)',
            textAlign: 'center',
          }}>
            שים לב: אתה רשום כרגע במקלט אחר. רישום חדש יחליף את הקודם.
          </div>
        )}

        {/* People Counter */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <label style={{
            display: 'block', fontSize: '15px', fontWeight: 600,
            marginBottom: '14px', color: 'var(--color-text-secondary)', textAlign: 'center',
          }}>
            כמה אנשים נכנסים איתך?
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setPeople(Math.max(1, people - 1))}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '22px', cursor: 'pointer',
              }}
            >−</button>
            <span style={{ fontSize: '36px', fontWeight: 800, minWidth: '48px', textAlign: 'center' }}>
              {people}
            </span>
            <button
              onClick={() => setPeople(people + 1)}
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)', fontSize: '22px', cursor: 'pointer',
              }}
            >+</button>
          </div>
        </div>

        <Button size="lg" style={{ width: '100%' }} onClick={handleSubmit}>
          דווח כניסה למקלט
        </Button>

        {/* Framework Registration Button (kindergartens/clubs staff) */}
        {currentUser && (
          currentUser.roles.includes('גננת') || currentUser.roles.includes('מנהלת גנים') ||
          currentUser.roles.includes('מועדונים') || currentUser.roles.includes('מנהלת מועדונים') ||
          currentUser.roles.includes('ADMIN')
        ) && (
          <button
            onClick={() => setShowFrameworkPopup(true)}
            style={{
              display: 'block', width: '100%', marginTop: '12px', padding: '14px',
              background: 'var(--color-success)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 800,
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            כניסת מסגרת למקלט
          </button>
        )}

        {/* Framework selection popup */}
        {showFrameworkPopup && (() => {
          const userRoles = currentUser?.roles || []
          const isAdmin = userRoles.includes('ADMIN')
          const showKindergartens = isAdmin || userRoles.includes('גננת') || userRoles.includes('מנהלת גנים')
          const showClubs = isAdmin || userRoles.includes('מועדונים') || userRoles.includes('מנהלת מועדונים')
          const kindergartens = showKindergartens ? getSourceKindergartens() : []
          const clubs = showClubs ? getSourceClubs() : []

          const handleFrameworkSelect = (name: string, type: 'kindergarten' | 'club', id: string) => {
            const attendance = type === 'kindergarten' ? getKindergartenAttendance(id) : getClubAttendance(id)
            const presentCount = attendance?.presentChildren?.length || 0
            if (presentCount === 0) {
              alert('אין נוכחות רשומה היום במסגרת זו')
              return
            }
            // Register all present children + staff member
            addCheckin({
              id: Date.now().toString(),
              shelterId: shelter.id,
              userId: currentUser?.id ?? 'anonymous',
              userName: `${name} — ${currentUser?.fullName || ''}`,
              userPhone: currentUser?.phone || '',
              userHouseNumber: '',
              peopleCount: presentCount + 1,
              timestamp: Date.now(),
            })
            setShowFrameworkPopup(false)
            setFrameworkSubmitted({ name, count: presentCount })
          }

          return (
            <div
              onClick={() => setShowFrameworkPopup(false)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '20px',
              }}
            >
              <div onClick={e => e.stopPropagation()} style={{
                background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
                border: '2px solid var(--color-success)', overflow: 'hidden',
                width: '100%', maxWidth: '360px', maxHeight: '70vh', overflowY: 'auto',
              }}>
                <div style={{ padding: '14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', background: 'rgba(77, 232, 138, 0.05)' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>בחר מסגרת</span>
                  <button onClick={() => setShowFrameworkPopup(false)} style={{
                    position: 'absolute', top: 10, left: 10, background: 'none', border: 'none',
                    color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer',
                  }}>✕</button>
                </div>
                {kindergartens.map(kg => (
                  <button key={kg.id} onClick={() => handleFrameworkSelect(kg.name, 'kindergarten', kg.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '14px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                  }}>
                    <span style={{ fontSize: '24px' }}>🏫</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{kg.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{kg.children?.length || 0} ילדים רשומים</p>
                    </div>
                  </button>
                ))}
                {clubs.map(club => (
                  <button key={club.id} onClick={() => handleFrameworkSelect(club.name, 'club', club.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '14px', background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', textAlign: 'right', color: 'var(--color-text)',
                  }}>
                    <span style={{ fontSize: '24px' }}>⚽</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{club.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{club.children?.length || 0} ילדים רשומים</p>
                    </div>
                  </button>
                ))}
                {kindergartens.length === 0 && clubs.length === 0 && (
                  <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>אין מסגרות רשומות</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* Framework submitted success */}
        {frameworkSubmitted && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius)',
              border: '2px solid var(--color-success)', padding: '32px 40px', textAlign: 'center',
              boxShadow: '0 0 30px rgba(77, 232, 138, 0.3)',
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>✅</span>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-success)', margin: '0 0 8px' }}>
                {frameworkSubmitted.name}
              </p>
              <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 4px' }}>
                {frameworkSubmitted.count} ילדים + 1 עובד/ת
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
                נרשמו במקלט {shelter.name}
              </p>
              <button onClick={() => setFrameworkSubmitted(null)} style={{
                background: 'var(--color-success)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '10px 32px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              }}>סגור</button>
            </div>
          </div>
        )}

        {/* Guest Registration Button (for shelter managers / חמ"ל / ADMIN only) */}
        {currentUser && (currentUser.roles.includes('מנהל מקלט') || currentUser.roles.includes('חמ"ל') || currentUser.roles.includes('ADMIN')) && (
          <Button
            variant="secondary"
            size="md"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => navigate(`/shelter/${shelter.id}/guest`)}
          >
            רישום אורח (מנהל מקלט)
          </Button>
        )}

        <button
          onClick={() => navigate('/report')}
          style={{
            display: 'block', width: '100%', marginTop: '14px',
            background: 'none', border: 'none', color: 'var(--color-text-secondary)',
            fontSize: '13px', cursor: 'pointer', textAlign: 'center',
          }}
        >
          חזרה למקלטים
        </button>
      </div>
    </div>
  )
}
