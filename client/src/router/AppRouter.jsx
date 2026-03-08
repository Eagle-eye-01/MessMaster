import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

import Landing from '../pages/Landing'
import StaffLogin from '../pages/StaffLogin'
import StudentLogin from '../pages/StudentLogin'
import SetupWizard from '../pages/SetupWizard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Overview from '../pages/dashboard/Overview'
import MenuAnalysis from '../pages/dashboard/MenuAnalysis'
import Oracle from '../pages/dashboard/Oracle'
import LogWaste from '../pages/dashboard/LogWaste'
import FeedbackPage from '../pages/dashboard/FeedbackPage'
import CookReviews from '../pages/dashboard/CookReviews'
import InventoryPage from '../pages/dashboard/InventoryPage'
import SetupPage from '../pages/dashboard/SetupPage'
import StudentPortal from '../pages/student/StudentPortal'

const ProtectedRoute = ({ children, role }) => {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-green animate-pulse font-display text-2xl">MessMaster</div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'staff' ? '/dashboard/overview' : '/student'} replace />
  return children
}

export default function AppRouter() {
  const init = useAuthStore(s => s.init)

  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/setup" element={
          <ProtectedRoute role="staff"><SetupWizard /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute role="staff"><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="menu-analysis" element={<MenuAnalysis />} />
          <Route path="oracle" element={<Oracle />} />
          <Route path="log-waste" element={<LogWaste />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="cook-reviews" element={<CookReviews />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="setup" element={<SetupPage />} />
        </Route>
        <Route path="/student" element={
          <ProtectedRoute role="student"><StudentPortal /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
