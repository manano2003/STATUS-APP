import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { getShelterById } from '../data/shelters'
import BackButton from '../components/BackButton'

export default function DashboardUsers() {
  const navigate = useNavigate()
  const { users, checkins } = useStore()

  return (
    <div style={{ paddingTop: '68px', padding: '68px 16px 100px', maxWidth: '1000px', margin: '0 auto' }}>
      <BackButton to="/dashboard/sources" />

      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' , justifyContent: 'center'}}>
        <span>👥</span> רשומים במערכת
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' , textAlign: 'center'}}>
        {users.length} משתמשים רשומים
      </p>

      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {users.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            אין משתמשים רשומים עדיין
          </p>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 50px 50px 70px',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}>
              <span>שם מלא</span>
              <span>טלפון</span>
              <span style={{ textAlign: 'center' }}>בית</span>
              <span style={{ textAlign: 'center' }}>נפשות</span>
              <span style={{ textAlign: 'center' }}>מקלט</span>
            </div>
            {users.map(user => {
              const checkin = checkins.find(c => c.userId === user.id)
              const shelterName = checkin ? getShelterById(checkin.shelterId)?.name : null
              return (
                <div
                  key={user.id}
                  onClick={() => navigate(`/dashboard/user/${user.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 50px 50px 70px',
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 166, 232, 0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{user.fullName}</span>
                  <span style={{ direction: 'ltr', textAlign: 'right', fontSize: '11px' }}>
                    {user.phone ? `+972${user.phone}` : '—'}
                  </span>
                  <span style={{ textAlign: 'center' }}>{user.houseNumber || '—'}</span>
                  <span style={{ textAlign: 'center' }}>{user.residents}</span>
                  <span style={{
                    textAlign: 'center', fontSize: '11px',
                    color: shelterName ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}>
                    {shelterName ?? '—'}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
