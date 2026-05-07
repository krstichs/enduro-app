interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ variant = 'dark', className = '' }: LogoProps) {
  const logoSrc = variant === 'light' 
    ? '/src/assets/logo-light.png' 
    : '/src/assets/logo-dark.png'

  return (
    <img 
      src={logoSrc} 
      alt="Enduro" 
      className={`h-8 ${className}`}
    />
  )
}