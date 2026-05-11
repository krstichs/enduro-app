import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, showBack, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 bg-enduro-dark-bg border-b border-gray-700 px-4 py-3 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-enduro-dark rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <Logo variant="dark" className="h-12" />
          )}
          
          {title && (
            <h1 className="text-xl font-bold truncate">{title}</h1>
          )}
        </div>

        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  )
}