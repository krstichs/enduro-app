import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, X } from 'lucide-react'

interface RestTimerProps {
  totalSeconds: number
  onComplete: () => void
  onSkip: () => void
}

export function RestTimer({ totalSeconds, onComplete, onSkip }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, secondsLeft, onComplete])

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-enduro-gray rounded-3xl w-full max-w-sm p-8 text-center">
        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Progress Ring */}
          <svg className="w-48 h-48 mx-auto -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#00D9FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <div className="text-6xl font-black mb-2">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <p className="text-gray-400 text-sm">Rest Time</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-16 h-16 bg-gym-gradient rounded-full flex items-center justify-center shadow-lg shadow-gym-orange/30 active:scale-95 transition-transform"
          >
            {isPaused ? <Play size={28} fill="white" /> : <Pause size={28} fill="white" />}
          </button>

          <button
            onClick={onSkip}
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          {isPaused ? 'Paused' : 'Next set starting soon...'}
        </p>
      </div>
    </div>
  )
}