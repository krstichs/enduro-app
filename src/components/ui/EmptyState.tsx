import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gym-orange/20 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
          <Icon size={36} className="text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary-gym inline-flex items-center gap-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}