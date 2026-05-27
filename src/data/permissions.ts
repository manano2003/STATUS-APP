/**
 * Permission system for STATUS app
 * Controls which tabs and dashboard cards each role can see.
 * A user can have multiple roles - they see the UNION of all permissions.
 */

export function hasPermission(roles: string[], feature: string): boolean {
  if (!roles || roles.length === 0) return false
  if (roles.includes('ADMIN')) return true
  if (roles.includes('חמ"ל')) return true // חמ"ל sees everything

  switch (feature) {
    case 'admin':
      return roles.includes('ADMIN')

    case 'report':
      return true // everyone sees מקלטים

    case 'kindergartens':
      return roles.includes('גננת') || roles.includes('מנהלת גנים')

    case 'clubs':
      return roles.includes('מועדונים') || roles.includes('מנהלת מועדונים')

    case 'shelter-issues':
      return roles.includes('מנהל מקלט')

    case 'emergency-status':
      return roles.includes('מס"ר')

    case 'dashboard':
      return roles.includes('מנהלת גנים') || roles.includes('מנהלת מועדונים')

    // Dashboard sub-pages
    case 'dashboard-shelters':
      return true // anyone with dashboard access sees this

    case 'dashboard-kindergartens':
      return roles.includes('מנהלת גנים')

    case 'dashboard-clubs':
      return roles.includes('מנהלת מועדונים')

    case 'dashboard-distress':
    case 'dashboard-issues':
    case 'dashboard-emergency':
    case 'dashboard-sources':
    case 'dashboard-reports':
    case 'dashboard-history':
    case 'dashboard-backup':
      return false // only חמ"ל and ADMIN

    default:
      return false
  }
}
