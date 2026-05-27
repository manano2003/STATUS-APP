import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { hasPermission } from '../data/permissions'

interface NavItem {
  path: string
  label: string
  icon: string
  feature: string
}

const allNavItems: NavItem[] = [
  { path: '/report', label: 'מקלטים', icon: '🏛️', feature: 'report' },
  { path: '/kindergartens', label: 'גני ילדים', icon: '👶', feature: 'kindergartens' },
  { path: '/clubs', label: 'מועדונים', icon: '⚽', feature: 'clubs' },
  { path: '/shelter-issues', label: 'תקלות במקלטים', icon: '🔧', feature: 'shelter-issues' },
  { path: '/emergency-status', label: 'עדכון תושבים', icon: '🚨', feature: 'emergency-status' },
  { path: '/dashboard', label: 'חמ"ל', icon: '📊', feature: 'dashboard' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, setCurrentUser, distressAlerts } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleItems = currentUser
    ? allNavItems.filter(item => hasPermission(currentUser.roles, item.feature))
    : allNavItems

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text)',
            fontSize: '22px', cursor: 'pointer', padding: '4px',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Logo center - absolute positioned for true center */}
        <Link to="/report" style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
        }}
          onClick={() => setMenuOpen(false)}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '3px' }}>
            STATUS
          </span>
          <span style={{ fontSize: '7px', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '1.5px' }}>
            COMMUNITY AWARENESS SYSTEM
          </span>
        </Link>

        {/* SOS button - hidden on admin pages */}
        {!location.pathname.startsWith('/communities') && !location.pathname.startsWith('/admin/management') && !location.pathname.startsWith('/schools') ? (
          <button
            className={distressAlerts.length > 0 ? 'sos-blink' : ''}
            onClick={() => { setMenuOpen(false); navigate('/distress') }}
            style={{
              background: 'rgba(232, 77, 77, 0.2)',
              border: '2px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--color-danger)',
              letterSpacing: '1px',
            }}
          >
            SOS
          </button>
        ) : <div style={{ width: '58px' }} />}
      </header>

      {/* Navigation Menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            right: 0,
            left: 0,
            bottom: 0,
            zIndex: 99,
            background: 'rgba(10, 22, 40, 0.97)',
            backdropFilter: 'blur(12px)',
            padding: '8px 16px',
            overflowY: 'auto',
          }}
          onClick={() => setMenuOpen(false)}
        >
          {/* Personal Area in menu */}
          {currentUser ? (
            <>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '4px',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2px' }}>
                  {currentUser.fullName}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {currentUser.city} | +972{currentUser.phone}
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {currentUser.roles.filter(r => r !== 'USR').map(r => (
                    <span key={r} style={{
                      padding: '1px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 700,
                      background: r === 'ADMIN' ? 'rgba(232, 77, 77, 0.15)' : 'rgba(77, 166, 232, 0.1)',
                      color: r === 'ADMIN' ? 'var(--color-danger)' : 'var(--color-accent)',
                    }}>{r}</span>
                  ))}
                </div>
              </div>
              <Link
                to="/profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: '15px', fontWeight: 600, color: 'var(--color-accent)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '20px' }}>👤</span>
                אזור אישי
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: '20px' }}>🔑</span>
              התחברות
            </Link>
          )}

          {/* Nav items */}
          {visibleItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '16px',
                fontWeight: 600,
                color: location.pathname === item.path ? 'var(--color-accent)' : 'var(--color-text)',
                background: location.pathname === item.path ? 'rgba(77, 166, 232, 0.1)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Admin link */}
          {currentUser?.roles.includes('ADMIN') && (
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate('/communities')
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', width: '100%',
                fontSize: '15px', fontWeight: 600,
                color: 'var(--color-accent)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: '1px solid var(--color-border)',
                marginTop: '8px',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚙️</span>
              חזור לדף מנהל
            </button>
          )}

          {/* Logout at bottom */}
          {currentUser && (
            <button
              onClick={() => {
                setCurrentUser(null)
                setMenuOpen(false)
                navigate('/login')
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', width: '100%',
                fontSize: '15px', fontWeight: 600,
                color: 'var(--color-danger)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: '1px solid var(--color-border)',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: '20px' }}>🚪</span>
              התנתקות
            </button>
          )}
        </div>
      )}
    </>
  )
}
