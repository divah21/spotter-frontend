import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

function Sidebar({ title = 'Spotter', subtitle, navItems = [], activePath = '/', onLogout, onLinkClick }) {
  const isActive = (href) => activePath === href || (activePath.startsWith(href) && href !== '/')

  return (
    <div className="flex flex-col h-full bg-[#032a36] text-white">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="text-sm text-[#8ba9c4] mt-1">{subtitle}</p> : null}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} to={item.href} onClick={onLinkClick}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-white/10 hover:text-white text-base py-6 ${
                  isActive(item.href) ? 'bg-white/10' : ''
                }`}
              >
                {Icon ? <Icon className="mr-3 h-6 w-6" /> : null}
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white text-base py-6"
          onClick={onLogout}
        >
          {navItems?.logoutIcon ? <navItems.logoutIcon className="mr-3 h-6 w-6" /> : null}
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
