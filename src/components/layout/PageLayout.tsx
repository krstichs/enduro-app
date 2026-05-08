import { type ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  headerAction?: React.ReactNode
  showBottomNav?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  showBack, 
  headerAction,
  showBottomNav = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-enduro-dark text-enduro-light">
      <Header title={title} showBack={showBack} rightAction={headerAction} />
      
      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  )
}