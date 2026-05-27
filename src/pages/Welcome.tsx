import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export default function Welcome() {
  const navigate = useNavigate()

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
        textAlign: 'center',
      }}>
        <img
          src={logo}
          alt="STATUS"
          style={{ width: '180px', borderRadius: '16px', margin: '0 auto 32px', display: 'block' }}
        />

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '40px', textAlign: 'center' }}>
          ברוך הבא למערכת STATUS
        </h1>

        <button
          onClick={() => navigate('/register')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          משתמש חדש - הירשם
        </button>

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-accent)',
            background: 'transparent',
            color: 'var(--color-accent)',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          משתמש קיים - היכנס
        </button>
      </div>
    </div>
  )
}
