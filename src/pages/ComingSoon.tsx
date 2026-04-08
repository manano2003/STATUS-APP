import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import BackButton from '../components/BackButton'

interface ComingSoonProps {
  title: string
  icon: string
}

export default function ComingSoon({ title, icon }: ComingSoonProps) {
  const navigate = useNavigate()

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
      <div style={{ position: 'absolute', top: '68px', right: '16px' }}><BackButton /></div>
      <span style={{ fontSize: '56px' }}>{icon}</span>
      <h1 style={{ fontSize: '24px', fontWeight: 800 , textAlign: 'center'}}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' , textAlign: 'center'}}>
        עמוד זה בפיתוח ויהיה זמין בקרוב
      </p>
      <Button size="lg" onClick={() => navigate('/report')} style={{ marginTop: '8px' }}>
        חזרה למקלטים
      </Button>
    </div>
  )
}
