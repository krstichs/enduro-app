import { Link, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Activity, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { usePreferences } from '../../hooks/usePreferences'

export function BottomNav() {
  const location = useLocation()
  const { preferences } = usePreferences()

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard', enabled: true },
    { 
      icon: Dumbbell, 
      label: 'Gym', 
      path: '/gym', 
      enabled: preferences?.gym_enabled ?? true 
    },
    { 
      icon: Activity, 
      label: 'Run', 
      path: '/running', 
      enabled: preferences?.running_enabled ?? true 
    },
    { icon: User, label: 'Profile', path: '/profile', enabled: true },
  ].filter(item => item.enabled) // Hide disabled items

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-enduro-gray/80 backdrop-blur-xl border-t border-white/5 px-4 py-2 safe-area-bottom z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path
          
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              {isActive && (
                <div className="absolute inset-0 bg-gym-gradient opacity-10 rounded-xl" />
              )}
              
              <div className={cn(
                'relative transition-colors',
                isActive ? 'text-gym-orange' : 'text-gray-400'
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={cn(
                'text-xs font-medium transition-colors',
                isActive ? 'text-gym-orange' : 'text-gray-400'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}