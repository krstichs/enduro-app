import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 10)

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle size={24} className="text-success-green" />,
    error: <XCircle size={24} className="text-red-400" />,
    info: <Info size={24} className="text-run-cyan" />,
    warning: <AlertCircle size={24} className="text-gym-orange" />,
  }

  const colors = {
    success: 'bg-success-green/20 border-success-green/40',
    error: 'bg-red-900/20 border-red-500/40',
    info: 'bg-run-cyan/20 border-run-cyan/40',
    warning: 'bg-gym-orange/20 border-gym-orange/40',
  }

  return (
    <div
      className={`fixed top-20 right-4 z-[100] transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`glass-card ${colors[type]} border rounded-2xl p-4 shadow-2xl min-w-[300px] max-w-md`}>
        <div className="flex items-center gap-3">
          {icons[type]}
          <p className="flex-1 font-semibold text-white">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}