import { useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'

interface SetLoggerProps {
  setNumber: number
  targetReps: number
  trackWeight: boolean
  trackReps: boolean
  trackTime: boolean
  onComplete: (data: { weight?: number; reps?: number; time?: number }) => void
}

export function SetLogger({
  setNumber,
  targetReps,
  trackWeight,
  trackReps,
  trackTime,
  onComplete,
}: SetLoggerProps) {
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(targetReps)
  const [time, setTime] = useState<number>(0)

  function handleComplete() {
    onComplete({
      weight: trackWeight ? weight : undefined,
      reps: trackReps ? reps : undefined,
      time: trackTime ? time : undefined,
    })
  }

  function incrementValue(type: 'weight' | 'reps' | 'time', amount: number) {
    if (type === 'weight') setWeight(prev => Math.max(0, prev + amount))
    if (type === 'reps') setReps(prev => Math.max(0, prev + amount))
    if (type === 'time') setTime(prev => Math.max(0, prev + amount))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl font-black text-gym-orange mb-2">
          Set {setNumber}
        </div>
        <p className="text-gray-400">Enter your performance</p>
      </div>

      {/* Weight Input */}
      {trackWeight && (
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-semibold text-gray-400 mb-4 text-center">
            Weight (kg)
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => incrementValue('weight', -2.5)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus size={24} />
            </button>

            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-32 text-center text-4xl font-black bg-transparent border-none focus:outline-none"
              step="0.5"
            />

            <button
              onClick={() => incrementValue('weight', 2.5)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Reps Input */}
      {trackReps && (
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-semibold text-gray-400 mb-4 text-center">
            Reps
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => incrementValue('reps', -1)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus size={24} />
            </button>

            <input
              type="number"
              value={reps || ''}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              className="w-32 text-center text-4xl font-black bg-transparent border-none focus:outline-none"
            />

            <button
              onClick={() => incrementValue('reps', 1)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Time Input */}
      {trackTime && (
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-semibold text-gray-400 mb-4 text-center">
            Time (seconds)
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => incrementValue('time', -5)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus size={24} />
            </button>

            <input
              type="number"
              value={time || ''}
              onChange={(e) => setTime(parseInt(e.target.value) || 0)}
              className="w-32 text-center text-4xl font-black bg-transparent border-none focus:outline-none"
            />

            <button
              onClick={() => incrementValue('time', 5)}
              className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        className="w-full btn-primary-gym flex items-center justify-center gap-3 py-4 text-lg"
      >
        <Check size={24} strokeWidth={3} />
        Complete Set
      </button>
    </div>
  )
}