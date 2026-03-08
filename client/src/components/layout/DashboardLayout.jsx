import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ChefHat, Brain, ClipboardList,
  MessageSquare, Star, Package, Settings, LogOut, Menu
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const NAV = [
  { to: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { to: 'menu-analysis', icon: ChefHat, label: 'Menu Analysis' },
  { to: 'oracle', icon: Brain, label: 'Oracle' },
  { to: 'log-waste', icon: ClipboardList, label: 'Log Waste' },
  { to: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { to: 'cook-reviews', icon: Star, label: 'Cook Reviews' },
  { to: 'inventory', icon: Package, label: 'Inventory' },
  { to: 'setup', icon: Settings, label: 'Setup' },
]

export default function DashboardLayout() {
  const { user, logout, sidebarOpen, toggleSidebar } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 64 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-border h-16">
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <span className="font-display font-bold text-green text-lg">MessMaster</span>
            </motion.div>
          )}
          <button onClick={toggleSidebar} className="ml-auto text-muted hover:text-primary p-1">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={`/dashboard/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive ? 'bg-green/10 text-green' : 'text-muted hover:text-primary hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{label}</motion.span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 text-muted hover:text-red text-sm transition-colors w-full">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-muted">
            <span className="text-primary font-semibold">{user?.name}</span>
            <span className="mx-2">·</span>
            <span>Mess Staff</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center text-green text-sm font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
