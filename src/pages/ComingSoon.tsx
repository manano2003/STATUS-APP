import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import PageLayout from '../components/PageLayout'

interface ComingSoonProps {
  title: string
  icon: string
}

export default function ComingSoon({ title, icon }: ComingSoonProps) {
  const navigate = useNavigate()

  return (
    <PageLayout title={title} subtitle="עמוד זה בפיתוח ויהיה זמין בקרוב">
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <span style={{ fontSize: '56px' }}>{icon}</span>
        <div style={{ marginTop: '16px' }}>
          <Button size="lg" onClick={() => navigate('/report')} style={{ marginTop: '8px' }}>
            חזרה למקלטים
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
