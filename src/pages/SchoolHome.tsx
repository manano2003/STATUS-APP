import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../data/store'
import BackButton from '../components/BackButton'

const STORAGE_KEY = 'status_schools'

function getSchoolName(id: string): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const schools = JSON.parse(saved)
      const school = schools.find((s: any) => s.id === id)
      if (school) return school.name
    }
  } catch {}
  return id === 'hartuv' ? 'הרטוב' : id
}

function getSchoolCouncilId(id: string): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const schools = JSON.parse(saved)
      const school = schools.find((s: any) => s.id === id)
      if (school) return school.councilId
    }
  } catch {}
  return 'mateh-yehuda'
}

export default function SchoolHome({ content, backTo }: { content?: React.ReactNode; backTo?: string }) {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useStore()

  const schoolName = schoolId ? getSchoolName(schoolId) : 'בית ספר'
  const currentTab = location.pathname.includes('/council-view') ? 'council'
    : location.pathname.includes('/management') ? 'management'
    : location.pathname.includes('/classes') ? 'classes'
    : 'home'

  // Check if user can see council tab (ADMIN or עובד מועצה)
  const isAdmin = currentUser?.roles?.includes('ADMIN')
  const councilId = schoolId ? getSchoolCouncilId(schoolId) : ''
  const isCouncilWorker = (() => {
    try {
      const councilUsers = JSON.parse(localStorage.getItem(`council_users_${councilId}`) || '[]')
      return councilUsers.some((u: any) => u.phone === currentUser?.phone || u.email === currentUser?.email)
    } catch { return false }
  })()
  const showCouncilTab = isAdmin || isCouncilWorker || true // TODO: temp show for all

  const tabs = [
    { id: 'classes', label: 'כיתות', icon: '📚', path: `/schools/${schoolId}/classes` },
    { id: 'management', label: 'מזכירות', icon: '📊', path: `/schools/${schoolId}/management` },
    ...(showCouncilTab ? [{ id: 'council', label: 'מועצה', icon: '🏛️', path: `/schools/${schoolId}/council-view` }] : []),
  ]

  const subtitleMap: Record<string, string> = { management: 'מזכירות', classes: 'כיתות', council: 'מועצה' }

  return (
    <div style={{ paddingTop: '56px', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{
        position: 'sticky', top: 56, zIndex: 50,
        background: 'var(--color-bg-primary)',
        padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <BackButton to={backTo || (currentTab === 'home' ? '/schools/councils' : `/schools/${schoolId}/management`)} />
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, textAlign: 'center' }}>
          {schoolName}
        </h1>
        {currentTab !== 'home' && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0', textAlign: 'center' }}>
            {subtitleMap[currentTab] || ''}
          </p>
        )}
      </div>

      <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
        {content || (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>בחר טאב למטה</p>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex',
        background: 'rgba(10, 22, 40, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 90,
      }}>
        {tabs.map(tab => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1, padding: '10px 0',
                background: isActive ? 'rgba(77, 166, 232, 0.15)' : 'none',
                border: 'none',
                borderTop: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}
            >
              <span style={{ fontSize: '20px', filter: isActive ? 'none' : 'grayscale(1)', opacity: isActive ? 1 : 0.5 }}>{tab.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
