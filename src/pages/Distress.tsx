import { useState } from 'react'
import { distressTypes } from '../data/distressTypes'
import PageLayout from '../components/PageLayout'

export default function Distress() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <PageLayout title="לחצן מצוקה" subtitle="בחר את סוג האירוע לשליחת קריאת מצוקה">

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {distressTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setShowPopup(true)}
            style={{
              background: 'var(--color-bg-card)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-danger)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(232, 77, 77, 0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(77, 166, 232, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '16 / 9',
              overflow: 'hidden',
            }}>
              <img
                src={type.imageUrl}
                alt={type.label}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
                }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: '14px 8px' }}>
              <p style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
              }}>
                {type.label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => setShowPopup(false)}>
          <div style={{
            background: 'var(--color-bg-card)',
            border: '2px solid var(--color-accent)',
            borderRadius: 'var(--radius)',
            padding: '32px 24px',
            maxWidth: '320px',
            textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-accent)', textAlign: 'center' }}>
              אזור בבניה
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
              פיצ'ר זה יהיה זמין בקרוב
            </p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 32px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
