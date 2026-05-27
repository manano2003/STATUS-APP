import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../data/store'
import { hasPermission } from '../data/permissions'

const allTabs = [
  { path: '/report', label: 'מקלטים', icon: '🏛️', feature: 'report' },
  { path: '/kindergartens', label: 'גנים', icon: '👶', feature: 'kindergartens' },
  { path: '/clubs', label: 'מועדונים', icon: '⚽', feature: 'clubs' },
  { path: '/shelter-issues', label1: 'תקלות', label2: 'במקלטים', icon: '🔧', feature: 'shelter-issues' },
  { path: '/emergency-status', label1: 'עדכון', label2: 'תושבים', icon: '🚨', feature: 'emergency-status' },
  { path: '/dashboard', label: 'חמ"ל', icon: '📊', feature: 'dashboard' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useStore()

  const tabs = currentUser
    ? allTabs.filter(tab => hasPermission(currentUser.roles, tab.feature))
    : allTabs

  if (
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/welcome') ||
    location.pathname === '/communities' ||
    location.pathname.startsWith('/communities/') ||
    location.pathname.startsWith('/admin/management') ||
    location.pathname.startsWith('/schools')
  ) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      background: 'rgba(10, 22, 40, 0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)',
      zIndex: 90,
    }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/')
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              padding: '6px 0 8px',
              background: isActive ? 'rgba(77, 166, 232, 0.15)' : 'none',
              border: 'none',
              borderTop: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1px',
            }}
          >
            <span style={{
              fontSize: '18px',
              filter: isActive ? 'none' : 'grayscale(1)',
              opacity: isActive ? 1 : 0.5,
            }}>
              {tab.icon}
            </span>
            {'label2' in tab && tab.label2 ? (
              <>
                <span style={{
                  fontSize: '8px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  lineHeight: 1.1,
                }}>
                  {tab.label1}
                </span>
                <span style={{
                  fontSize: '8px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  lineHeight: 1.1,
                }}>
                  {tab.label2}
                </span>
              </>
            ) : (
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}>
                {tab.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
