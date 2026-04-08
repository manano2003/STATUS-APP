import { useNavigate } from 'react-router-dom'
import { distressTypes } from '../data/distressTypes'
import BackButton from '../components/BackButton'

export default function Distress() {
  const navigate = useNavigate()

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '500px', margin: '0 auto' }}>
      <BackButton />

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '8px' , textAlign: 'center'}}>
          לחצן מצוקה
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' , textAlign: 'center'}}>
          בחר את סוג האירוע לשליחת קריאת מצוקה
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {distressTypes.map(type => (
          <button
            key={type.id}
            onClick={() => navigate(`/distress/${type.id}`)}
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
              height: '120px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
            }}>
              <img
                src={type.imageUrl}
                alt={type.label}
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  ...(type.id === 'medical' ? { filter: 'invert(1)' } : {}),
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
    </div>
  )
}
