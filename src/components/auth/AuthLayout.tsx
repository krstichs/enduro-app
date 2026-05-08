import { type ReactNode } from 'react'
import { Logo } from '../Logo'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-enduro-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="light" className="h-12" />
          </div>
          <h1 className="text-3xl font-bold text-enduro-light mb-2">{title}</h1>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>

        <div className="bg-enduro-gray rounded-xl p-8 border border-gray-700">
          {children}
        </div>
      </div>
    </div>
  )
}