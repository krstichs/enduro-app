import { Link, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Activity, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Dumbbell, label: 'Gym', path: '/gym' },
  { icon: Activity, label: 'Running', path: '/running' },
  { icon: User, label: 'Profile', path: '/profile' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-enduro-gray border-t border-gray-700 px-4 py-2 safe-area-bottom md:hidden z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive 
                  ? 'text-gym-orange' 
                  : 'text-gray-400 hover:text-enduro-light'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}