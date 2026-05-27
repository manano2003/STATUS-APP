import { Navigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { hasPermission } from '../data/permissions'

interface Props {
  feature: string
  children: React.ReactNode
}

export default function ProtectedRoute({ feature, children }: Props) {
  const { currentUser } = useStore()

  // Not logged in - go to welcome
  if (!currentUser) {
    return <Navigate to="/welcome" replace />
  }

  // Check permission
  if (!hasPermission(currentUser.roles, feature)) {
    return <Navigate to="/report" replace />
  }

  return <>{children}</>
}
