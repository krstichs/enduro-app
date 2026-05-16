interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const logoSrc = variant === 'light' 
    ? '/logo-light.png' 
    : '/logo-dark.png'

  return (
    <img 
      src={logoSrc} 
      alt="Enduro" 
      className={className || 'h-8'}
    />
  )
}