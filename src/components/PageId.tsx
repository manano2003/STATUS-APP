import { useLocation } from 'react-router-dom'

const PAGE_IDS: Record<string, number> = {
  '/communities': 0,
  '/communities/list': 47,
  '/admin/management': 46,
  '/landing': 1,
  '/login': 2,
  '/register': 3,
  '/profile': 4,
  '/report': 10,
  '/distress': 11,
  '/kindergartens': 12,
  '/clubs': 13,
  '/shelter-issues': 14,
  '/emergency-status': 15,
  '/dashboard': 20,
  '/dashboard/sources': 21,
  '/dashboard/reports': 22,
  '/dashboard/users': 23,
  '/dashboard/shelters': 24,
  '/dashboard/distress': 25,
  '/dashboard/kindergartens': 26,
  '/dashboard/clubs': 27,
  '/dashboard/issues': 28,
  '/dashboard/emergency': 29,
  '/dashboard/qrcodes': 30,
  '/dashboard/history': 31,
  '/dashboard/history/checkins': 32,
  '/dashboard/history/shelters': 33,
  '/dashboard/history/issues': 34,
  '/dashboard/history/distress': 35,
  '/dashboard/history/kindergartens': 36,
  '/dashboard/history/clubs': 37,
  '/dashboard/permissions': 44,
  '/dashboard/sources/kindergartens': 42,
  '/dashboard/sources/clubs': 43,
  '/dashboard/backup': 48,
  '/dashboard/backup/users': 49,
  '/dashboard/backup/kindergartens': 80,
  '/dashboard/backup/clubs': 81,
  '/dashboard/sources/shelters': 82,
  '/dashboard/sources/residents': 83,
  '/dashboard/history/emergency': 84,
  '/dashboard/backup/residents': 85,
  '/dashboard/sources/issues': 86,
  '/schools/councils': 90,
  '/admin/users': 40,
  '/admin/shelters': 41,
}

// Dynamic routes: /shelter/:id => 50, /shelter/:id/guest => 51, etc.
function getPageId(pathname: string): number | null {
  if (PAGE_IDS[pathname] !== undefined) return PAGE_IDS[pathname]
  if (/^\/shelter\/[^/]+\/guest$/.test(pathname)) return 51
  if (/^\/shelter\/[^/]+$/.test(pathname)) return 50
  if (/^\/distress\/[^/]+$/.test(pathname)) return 52
  if (/^\/kindergartens\/[^/]+$/.test(pathname)) return 53
  if (/^\/clubs\/[^/]+$/.test(pathname)) return 54
  if (/^\/emergency-status\/[^/]+$/.test(pathname)) return 55
  if (/^\/dashboard\/shelters\/[^/]+$/.test(pathname)) return 60
  if (/^\/dashboard\/distress\/[^/]+$/.test(pathname)) return 61
  if (/^\/dashboard\/user\/[^/]+$/.test(pathname)) return 62
  if (/^\/dashboard\/issues\/[^/]+$/.test(pathname)) return 63
  if (/^\/dashboard\/permissions\/[^/]+$/.test(pathname)) return 45
  if (/^\/dashboard\/history\/shelters\/[^/]+\/[^/]+$/.test(pathname)) return 70
  if (/^\/dashboard\/history\/shelters\/[^/]+$/.test(pathname)) return 71
  if (/^\/dashboard\/history\/issues\/[^/]+\/[^/]+$/.test(pathname)) return 72
  if (/^\/dashboard\/history\/issues\/[^/]+$/.test(pathname)) return 73
  if (/^\/dashboard\/history\/distress\/[^/]+\/[^/]+$/.test(pathname)) return 74
  if (/^\/dashboard\/history\/distress\/[^/]+$/.test(pathname)) return 75
  if (/^\/dashboard\/history\/kindergartens\/[^/]+\/[^/]+$/.test(pathname)) return 76
  if (/^\/dashboard\/history\/kindergartens\/[^/]+$/.test(pathname)) return 77
  if (/^\/dashboard\/history\/clubs\/[^/]+\/[^/]+$/.test(pathname)) return 78
  if (/^\/dashboard\/history\/clubs\/[^/]+$/.test(pathname)) return 79
  if (/^\/schools\/council\/[^/]+\/permissions$/.test(pathname)) return 101
  if (/^\/schools\/council\/[^/]+\/camps$/.test(pathname)) return 107
  if (/^\/schools\/council\/[^/]+\/schools$/.test(pathname)) return 91
  if (/^\/schools\/council\/[^/]+\/categories$/.test(pathname)) return 108
  if (/^\/schools\/council\/[^/]+$/.test(pathname)) return 108
  if (/^\/schools\/[^/]+\/sources\/students$/.test(pathname)) return 100
  if (/^\/schools\/[^/]+\/sources\/users$/.test(pathname)) return 98
  if (/^\/schools\/[^/]+\/permissions$/.test(pathname)) return 99
  if (/^\/schools\/[^/]+\/sources$/.test(pathname)) return 95
  if (/^\/schools\/[^/]+\/management$/.test(pathname)) return 93
  if (/^\/schools\/[^/]+\/classes$/.test(pathname)) return 94
  if (/^\/schools\/[^/]+\/history$/.test(pathname)) return 96
  if (/^\/schools\/[^/]+\/council-view$/.test(pathname)) return 106
  if (/^\/schools\/[^/]+\/classes\/[^/]+\/attendance$/.test(pathname)) return 104
  if (/^\/schools\/[^/]+\/classes\/[^/]+\/emergency$/.test(pathname)) return 105
  if (/^\/schools\/[^/]+\/history\/[^/]+$/.test(pathname)) return 103
  if (/^\/schools\/[^/]+\/history$/.test(pathname)) return 102
  if (/^\/schools\/[^/]+\/backup$/.test(pathname)) return 97
  if (/^\/schools\/[^/]+$/.test(pathname)) return 92
  return null
}

export default function PageId() {
  const location = useLocation()
  const id = getPageId(location.pathname)
  if (id === null) return null

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      right: 16,
      zIndex: 9999,
      background: 'rgba(77, 166, 232, 0.15)',
      color: 'var(--color-accent)',
      fontSize: '14px',
      fontWeight: 800,
      padding: '4px 10px',
      borderRadius: '6px',
    }}>
      {id}
    </div>
  )
}
