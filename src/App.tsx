import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './data/store'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import PageId from './components/PageId'
import SaveIndicator from './components/SaveIndicator'
import { startAutoDrain } from './data/outbox'

startAutoDrain()
import Landing from './pages/Landing'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import DashboardSources from './pages/DashboardSources'
import DashboardReports from './pages/DashboardReports'
import DashboardUsers from './pages/DashboardUsers'
import DashboardShelters from './pages/DashboardShelters'
import DashboardDistress from './pages/DashboardDistress'
import DistressAlertDetail from './pages/DistressAlertDetail'
import ShelterReportDetail from './pages/ShelterReportDetail'
import UserDetail from './pages/UserDetail'
import Shelters from './pages/Shelters'
import ShelterCheckin from './pages/ShelterCheckin'
import GuestCheckin from './pages/GuestCheckin'
import Distress from './pages/Distress'
import DistressConfirm from './pages/DistressConfirm'
import AdminUsers from './pages/AdminUsers'
import AdminShelters from './pages/AdminShelters'
import ShelterIssues from './pages/ShelterIssues'
import DashboardIssues from './pages/DashboardIssues'
import DashboardIssueDetail from './pages/DashboardIssueDetail'
import DashboardHistory from './pages/DashboardHistory'
import HistoryCheckins from './pages/HistoryCheckins'
import HistoryShelters from './pages/HistoryShelters'
import HistoryShelterCalendar from './pages/HistoryShelterCalendar'
import HistoryShelterDay from './pages/HistoryShelterDay'
import HistoryIssues from './pages/HistoryIssues'
import HistoryDistress from './pages/HistoryDistress'
import Kindergartens from './pages/Kindergartens'
import KindergartenCheckin from './pages/KindergartenCheckin'
import DashboardKindergartens from './pages/DashboardKindergartens'
import HistoryIssueCalendar from './pages/HistoryIssueCalendar'
import HistoryIssueDay from './pages/HistoryIssueDay'
import HistoryDistressCalendar from './pages/HistoryDistressCalendar'
import HistoryDistressDay from './pages/HistoryDistressDay'
import HistoryKindergartens from './pages/HistoryKindergartens'
import HistoryKindergartenCalendar from './pages/HistoryKindergartenCalendar'
import HistoryKindergartenDay from './pages/HistoryKindergartenDay'
import Clubs from './pages/Clubs'
import ClubCheckin from './pages/ClubCheckin'
import DashboardClubs from './pages/DashboardClubs'
import HistoryClubs from './pages/HistoryClubs'
import HistoryClubCalendar from './pages/HistoryClubCalendar'
import HistoryClubDay from './pages/HistoryClubDay'
import EmergencyStatus from './pages/EmergencyStatus'
import ResidentStatus from './pages/ResidentStatus'
import DashboardEmergency from './pages/DashboardEmergency'
import ShelterQRCodes from './pages/ShelterQRCodes'
import SourceKindergartens from './pages/SourceKindergartens'
import SourceClubs from './pages/SourceClubs'
import SourceShelters from './pages/SourceShelters'
import SourceResidents from './pages/SourceResidents'
import SourceIssues from './pages/SourceIssues'
import Permissions from './pages/Permissions'
import PermissionDetail from './pages/PermissionDetail'
import ProtectedRoute from './components/ProtectedRoute'
import AdminCommunities from './pages/AdminCommunities'
import SchoolsCouncils from './pages/SchoolsCouncils'
import SchoolsList from './pages/SchoolsList'
import CouncilCategories from './pages/CouncilCategories'
import CouncilCamps from './pages/CouncilCamps'
import SchoolHome from './pages/SchoolHome'
import SchoolManagement from './pages/SchoolManagement'
import SchoolClasses from './pages/SchoolClasses'
import SchoolSources from './pages/SchoolSources'
import SchoolUsers from './pages/SchoolUsers'
import SchoolPermissions from './pages/SchoolPermissions'
import SchoolClassAttendance from './pages/SchoolClassAttendance'
import SchoolClassEmergency from './pages/SchoolClassEmergency'
import SchoolBackup from './pages/SchoolBackup'
import SchoolCouncilView from './pages/SchoolCouncilView'
import SchoolHistory from './pages/SchoolHistory'
import SchoolHistoryDay from './pages/SchoolHistoryDay'
import CouncilPermissions from './pages/CouncilPermissions'
import SchoolStudents from './pages/SchoolStudents'
import CommunitiesList from './pages/CommunitiesList'
import AdminManagement from './pages/AdminManagement'
import Backup from './pages/Backup'
import BackupUsers from './pages/BackupUsers'
import BackupKindergartens from './pages/BackupKindergartens'
import BackupClubs from './pages/BackupClubs'
import BackupResidents from './pages/BackupResidents'
import HistoryEmergency from './pages/HistoryEmergency'

export default function App() {
  const { currentUser } = useStore()
  return (
    <>
      <Header />
      <PageId />
      <Routes>
        <Route path="/" element={<Navigate to={currentUser ? (currentUser.roles.includes('ADMIN') ? "/communities" : "/report") : "/welcome"} replace />} />
        {/* Public pages */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/c/tsora" element={<Navigate to={currentUser ? "/report" : "/welcome"} replace />} />

        {/* Admin only */}
        <Route path="/communities" element={<ProtectedRoute feature="admin"><AdminCommunities /></ProtectedRoute>} />
        <Route path="/communities/list" element={<ProtectedRoute feature="admin"><CommunitiesList /></ProtectedRoute>} />
        <Route path="/admin/management" element={<ProtectedRoute feature="admin"><AdminManagement /></ProtectedRoute>} />
        <Route path="/schools/councils" element={<ProtectedRoute feature="admin"><SchoolsCouncils /></ProtectedRoute>} />
        <Route path="/schools/council/:councilId" element={<ProtectedRoute feature="admin"><CouncilCategories /></ProtectedRoute>} />
        <Route path="/schools/council/:councilId/categories" element={<ProtectedRoute feature="admin"><CouncilCategories /></ProtectedRoute>} />
        <Route path="/schools/council/:councilId/schools" element={<ProtectedRoute feature="admin"><SchoolsList /></ProtectedRoute>} />
        <Route path="/schools/council/:councilId/camps" element={<ProtectedRoute feature="admin"><CouncilCamps /></ProtectedRoute>} />
        <Route path="/schools/council/:councilId/permissions" element={<ProtectedRoute feature="admin"><CouncilPermissions /></ProtectedRoute>} />
        <Route path="/schools/:schoolId" element={<ProtectedRoute feature="admin"><SchoolHome /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/management" element={<ProtectedRoute feature="admin"><SchoolManagement /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/classes" element={<ProtectedRoute feature="admin"><SchoolClasses /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/sources" element={<ProtectedRoute feature="admin"><SchoolSources /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/sources/users" element={<ProtectedRoute feature="admin"><SchoolUsers /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/sources/students" element={<ProtectedRoute feature="admin"><SchoolStudents /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/classes/:className/attendance" element={<ProtectedRoute feature="admin"><SchoolClassAttendance /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/classes/:className/emergency" element={<ProtectedRoute feature="admin"><SchoolClassEmergency /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/permissions" element={<ProtectedRoute feature="admin"><SchoolPermissions /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/council-view" element={<ProtectedRoute feature="admin"><SchoolCouncilView /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/backup" element={<ProtectedRoute feature="admin"><SchoolBackup /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/history" element={<ProtectedRoute feature="admin"><SchoolHistory /></ProtectedRoute>} />
        <Route path="/schools/:schoolId/history/:date" element={<ProtectedRoute feature="admin"><SchoolHistoryDay /></ProtectedRoute>} />

        {/* Report - everyone logged in */}
        <Route path="/report" element={<ProtectedRoute feature="report"><Shelters /></ProtectedRoute>} />
        <Route path="/shelter/:id" element={<ProtectedRoute feature="report"><ShelterCheckin /></ProtectedRoute>} />
        <Route path="/shelter/:id/guest" element={<ProtectedRoute feature="report"><GuestCheckin /></ProtectedRoute>} />
        <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/welcome" replace />} />
        <Route path="/distress" element={currentUser ? <Distress /> : <Navigate to="/welcome" replace />} />
        <Route path="/distress/:type" element={currentUser ? <DistressConfirm /> : <Navigate to="/welcome" replace />} />

        {/* Kindergartens */}
        <Route path="/kindergartens" element={<ProtectedRoute feature="kindergartens"><Kindergartens /></ProtectedRoute>} />
        <Route path="/kindergartens/:id" element={<ProtectedRoute feature="kindergartens"><KindergartenCheckin /></ProtectedRoute>} />

        {/* Clubs */}
        <Route path="/clubs" element={<ProtectedRoute feature="clubs"><Clubs /></ProtectedRoute>} />
        <Route path="/clubs/:id" element={<ProtectedRoute feature="clubs"><ClubCheckin /></ProtectedRoute>} />

        {/* Shelter issues */}
        <Route path="/shelter-issues" element={<ProtectedRoute feature="shelter-issues"><ShelterIssues /></ProtectedRoute>} />

        {/* Emergency status */}
        <Route path="/emergency-status" element={<ProtectedRoute feature="emergency-status"><EmergencyStatus /></ProtectedRoute>} />
        <Route path="/emergency-status/:id" element={<ProtectedRoute feature="emergency-status"><ResidentStatus /></ProtectedRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute feature="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/shelters" element={<ProtectedRoute feature="dashboard"><DashboardShelters /></ProtectedRoute>} />
        <Route path="/dashboard/shelters/:id" element={<ProtectedRoute feature="dashboard"><ShelterReportDetail /></ProtectedRoute>} />
        <Route path="/dashboard/user/:id" element={<ProtectedRoute feature="dashboard"><UserDetail /></ProtectedRoute>} />
        <Route path="/dashboard/sources" element={<ProtectedRoute feature="dashboard-sources"><DashboardSources /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute feature="dashboard-sources"><DashboardUsers /></ProtectedRoute>} />
        <Route path="/dashboard/sources/kindergartens" element={<ProtectedRoute feature="dashboard-sources"><SourceKindergartens /></ProtectedRoute>} />
        <Route path="/dashboard/sources/clubs" element={<ProtectedRoute feature="dashboard-sources"><SourceClubs /></ProtectedRoute>} />
        <Route path="/dashboard/sources/shelters" element={<ProtectedRoute feature="dashboard-sources"><SourceShelters /></ProtectedRoute>} />
        <Route path="/dashboard/sources/residents" element={<ProtectedRoute feature="dashboard-sources"><SourceResidents /></ProtectedRoute>} />
        <Route path="/dashboard/sources/issues" element={<ProtectedRoute feature="dashboard-sources"><SourceIssues /></ProtectedRoute>} />
        <Route path="/dashboard/qrcodes" element={<ProtectedRoute feature="dashboard-sources"><ShelterQRCodes /></ProtectedRoute>} />
        <Route path="/dashboard/reports" element={<ProtectedRoute feature="dashboard-reports"><DashboardReports /></ProtectedRoute>} />
        <Route path="/dashboard/distress" element={<ProtectedRoute feature="dashboard-distress"><DashboardDistress /></ProtectedRoute>} />
        <Route path="/dashboard/distress/:id" element={<ProtectedRoute feature="dashboard-distress"><DistressAlertDetail /></ProtectedRoute>} />
        <Route path="/dashboard/kindergartens" element={<ProtectedRoute feature="dashboard-kindergartens"><DashboardKindergartens /></ProtectedRoute>} />
        <Route path="/dashboard/clubs" element={<ProtectedRoute feature="dashboard-clubs"><DashboardClubs /></ProtectedRoute>} />
        <Route path="/dashboard/emergency" element={<ProtectedRoute feature="dashboard-emergency"><DashboardEmergency /></ProtectedRoute>} />
        <Route path="/dashboard/issues" element={<ProtectedRoute feature="dashboard-issues"><DashboardIssues /></ProtectedRoute>} />
        <Route path="/dashboard/issues/:id" element={<ProtectedRoute feature="dashboard-issues"><DashboardIssueDetail /></ProtectedRoute>} />
        <Route path="/dashboard/permissions" element={<ProtectedRoute feature="dashboard-sources"><Permissions /></ProtectedRoute>} />
        <Route path="/dashboard/permissions/:role" element={<ProtectedRoute feature="dashboard-sources"><PermissionDetail /></ProtectedRoute>} />
        <Route path="/dashboard/backup" element={<ProtectedRoute feature="dashboard-sources"><Backup /></ProtectedRoute>} />
        <Route path="/dashboard/backup/users" element={<ProtectedRoute feature="dashboard-sources"><BackupUsers /></ProtectedRoute>} />
        <Route path="/dashboard/backup/kindergartens" element={<ProtectedRoute feature="dashboard-sources"><BackupKindergartens /></ProtectedRoute>} />
        <Route path="/dashboard/backup/clubs" element={<ProtectedRoute feature="dashboard-sources"><BackupClubs /></ProtectedRoute>} />
        <Route path="/dashboard/backup/residents" element={<ProtectedRoute feature="dashboard-sources"><BackupResidents /></ProtectedRoute>} />
        <Route path="/dashboard/history" element={<ProtectedRoute feature="dashboard-history"><DashboardHistory /></ProtectedRoute>} />
        <Route path="/dashboard/history/checkins" element={<ProtectedRoute feature="dashboard-history"><HistoryCheckins /></ProtectedRoute>} />
        <Route path="/dashboard/history/shelters" element={<ProtectedRoute feature="dashboard-history"><HistoryShelters /></ProtectedRoute>} />
        <Route path="/dashboard/history/shelters/:id" element={<ProtectedRoute feature="dashboard-history"><HistoryShelterCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/history/shelters/:id/:date" element={<ProtectedRoute feature="dashboard-history"><HistoryShelterDay /></ProtectedRoute>} />
        <Route path="/dashboard/history/issues" element={<ProtectedRoute feature="dashboard-history"><HistoryIssues /></ProtectedRoute>} />
        <Route path="/dashboard/history/issues/:id" element={<ProtectedRoute feature="dashboard-history"><HistoryIssueCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/history/issues/:id/:date" element={<ProtectedRoute feature="dashboard-history"><HistoryIssueDay /></ProtectedRoute>} />
        <Route path="/dashboard/history/distress/:type" element={<ProtectedRoute feature="dashboard-history"><HistoryDistressCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/history/distress/:type/:date" element={<ProtectedRoute feature="dashboard-history"><HistoryDistressDay /></ProtectedRoute>} />
        <Route path="/dashboard/history/kindergartens" element={<ProtectedRoute feature="dashboard-history"><HistoryKindergartens /></ProtectedRoute>} />
        <Route path="/dashboard/history/kindergartens/:id" element={<ProtectedRoute feature="dashboard-history"><HistoryKindergartenCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/history/kindergartens/:id/:date" element={<ProtectedRoute feature="dashboard-history"><HistoryKindergartenDay /></ProtectedRoute>} />
        <Route path="/dashboard/history/distress" element={<ProtectedRoute feature="dashboard-history"><HistoryDistress /></ProtectedRoute>} />
        <Route path="/dashboard/history/emergency" element={<ProtectedRoute feature="dashboard-history"><HistoryEmergency /></ProtectedRoute>} />
        <Route path="/dashboard/history/clubs" element={<ProtectedRoute feature="dashboard-history"><HistoryClubs /></ProtectedRoute>} />
        <Route path="/dashboard/history/clubs/:id" element={<ProtectedRoute feature="dashboard-history"><HistoryClubCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/history/clubs/:id/:date" element={<ProtectedRoute feature="dashboard-history"><HistoryClubDay /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute feature="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/shelters" element={<ProtectedRoute feature="admin"><AdminShelters /></ProtectedRoute>} />
      </Routes>
      <SaveIndicator />
      <BottomNav />
    </>
  )
}
