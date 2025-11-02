import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/redux/authSlice'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import { Menu, Home, Truck, FileText, Settings, LogOut, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'

function DriverLayout({ children }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/driver/dashboard' },
    { icon: Truck, label: 'Trips', href: '/driver/trips' },
    { icon: FileText, label: 'Logs', href: '/driver/logs' },
    { icon: Settings, label: 'Settings', href: '/driver/settings' },
  ]

  const activePath = location.pathname

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar
            title="Spotter"
            subtitle="Driver Portal"
            navItems={navItems}
            activePath={activePath}
            onLinkClick={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            logoutIcon={LogOut}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar
          title="Spotter"
          subtitle="Driver Portal"
          navItems={navItems}
          activePath={activePath}
          onLogout={handleLogout}
          logoutIcon={LogOut}
        />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-7 w-7" />
              </Button>
              <h2 className="text-xl font-semibold text-[#032a36]">Driver Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[#032a36]">
                    {user?.name || 'John Driver'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'driver@example.com'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#8ba9c4] flex items-center justify-center text-[#032a36] font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}

export default DriverLayout
