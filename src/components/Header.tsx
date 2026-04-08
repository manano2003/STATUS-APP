import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

const navItems = [
  { path: '/', label: 'ראשי' },
  { path: '/dashboard', label: 'חמ"ל' },
  { path: '/report', label: 'דיווח' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      zIndex: 100,
      background: 'rgba(10, 22, 40, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={logo} alt="STATUS" style={{ height: '36px', borderRadius: '6px' }} />
        <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '2px' }}>
          STATUS
        </span>
      </Link>

      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              color: location.pathname === item.path ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              background: location.pathname === item.path ? 'rgba(77, 166, 232, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          to="/login"
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, var(--color-accent), #3A8FD4)',
            marginRight: '8px',
          }}
        >
          התחברות
        </Link>
      </nav>
    </header>
  )
}
