import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Landing from './pages/Landing'
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

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/report" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/sources" element={<DashboardSources />} />
        <Route path="/dashboard/reports" element={<DashboardReports />} />
        <Route path="/dashboard/users" element={<DashboardUsers />} />
        <Route path="/dashboard/shelters" element={<DashboardShelters />} />
        <Route path="/dashboard/shelters/:id" element={<ShelterReportDetail />} />
        <Route path="/dashboard/distress" element={<DashboardDistress />} />
        <Route path="/dashboard/distress/:id" element={<DistressAlertDetail />} />
        <Route path="/dashboard/user/:id" element={<UserDetail />} />
        <Route path="/report" element={<Shelters />} />
        <Route path="/shelter/:id" element={<ShelterCheckin />} />
        <Route path="/shelter/:id/guest" element={<GuestCheckin />} />
        <Route path="/distress" element={<Distress />} />
        <Route path="/distress/:type" element={<DistressConfirm />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/shelters" element={<AdminShelters />} />
        <Route path="/kindergartens" element={<Kindergartens />} />
        <Route path="/kindergartens/:id" element={<KindergartenCheckin />} />
        <Route path="/dashboard/kindergartens" element={<DashboardKindergartens />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubCheckin />} />
        <Route path="/dashboard/clubs" element={<DashboardClubs />} />
        <Route path="/dashboard/history/clubs" element={<HistoryClubs />} />
        <Route path="/dashboard/history/clubs/:id" element={<HistoryClubCalendar />} />
        <Route path="/dashboard/history/clubs/:id/:date" element={<HistoryClubDay />} />
        <Route path="/dashboard/qrcodes" element={<ShelterQRCodes />} />
        <Route path="/emergency-status" element={<EmergencyStatus />} />
        <Route path="/emergency-status/:id" element={<ResidentStatus />} />
        <Route path="/dashboard/emergency" element={<DashboardEmergency />} />
        <Route path="/shelter-issues" element={<ShelterIssues />} />
        <Route path="/dashboard/issues" element={<DashboardIssues />} />
        <Route path="/dashboard/issues/:id" element={<DashboardIssueDetail />} />
        <Route path="/dashboard/history" element={<DashboardHistory />} />
        <Route path="/dashboard/history/checkins" element={<HistoryCheckins />} />
        <Route path="/dashboard/history/shelters" element={<HistoryShelters />} />
        <Route path="/dashboard/history/shelters/:id" element={<HistoryShelterCalendar />} />
        <Route path="/dashboard/history/shelters/:id/:date" element={<HistoryShelterDay />} />
        <Route path="/dashboard/history/issues" element={<HistoryIssues />} />
        <Route path="/dashboard/history/issues/:id" element={<HistoryIssueCalendar />} />
        <Route path="/dashboard/history/issues/:id/:date" element={<HistoryIssueDay />} />
        <Route path="/dashboard/history/distress/:type" element={<HistoryDistressCalendar />} />
        <Route path="/dashboard/history/distress/:type/:date" element={<HistoryDistressDay />} />
        <Route path="/dashboard/history/kindergartens" element={<HistoryKindergartens />} />
        <Route path="/dashboard/history/kindergartens/:id" element={<HistoryKindergartenCalendar />} />
        <Route path="/dashboard/history/kindergartens/:id/:date" element={<HistoryKindergartenDay />} />
        <Route path="/dashboard/history/distress" element={<HistoryDistress />} />
      </Routes>
      <BottomNav />
    </>
  )
}
