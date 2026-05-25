import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Star } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export function QuickLogRun() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [distance, setDistance] = useState<number>(5)
  const [minutes, setMinutes] = useState<number>(25)
  const [seconds, setSeconds] = useState<number>(0)
  const [rating, setRating] = useState<number>(0)
  const [effort, setEffort] = useState<number>(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const totalSeconds = minutes * 60 + seconds
  const pace = distance > 0 && totalSeconds > 0
    ? (totalSeconds / 60) / distance
    : 0

  function formatPace(paceValue: number) {
    const mins = Math.floor(paceValue)
    const secs = Math.round((paceValue - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  async function handleSave() {
    if (!user || distance <= 0 || totalSeconds <= 0) {
      showToast('Please enter valid distance and time', 'warning')
      return
    }

    if (rating === 0) {
      showToast('Please rate your run!', 'warning')
      return
    }

    setSaving(true)

    try {
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_type_id: 2,
          date: new Date().toISOString(),
          duration: totalSeconds,
          rating,
          perceived_effort: effort,
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      const { error: runError } = await supabase
        .from('running_sessions')
        .insert({
          session_id: session.id,
          distance,
          duration: totalSeconds,
        })

      if (runError) throw runError

      showToast('Run logged! Great work! 🏃', 'success')
      
      setTimeout(() => {
        navigate('/running')
      }, 1000)
    } catch (error) {
      console.error('Error logging run:', error)
      showToast('Error saving run. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="Log Run"
      showBack
      showBottomNav={false}
      headerAction={
        <button
          onClick={handleSave}
          disabled={saving || distance <= 0 || totalSeconds <= 0 || rating === 0}
          className="px-5 py-2 bg-gradient-to-r from-run-cyan to-blue-500 text-enduro-dark rounded-full font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-all"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      }
    >
      <div className="min-h-screen bg-[#070b11] pb-12 pt-4 px-4 text-white font-sans">
        <div className="max-w-md mx-auto space-y-5">
          
          {/* DISTANCE CARD */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-run-cyan to-transparent opacity-50"></div>
            
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Distance</h2>
            
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <input
                type="number"
                value={distance || ''}
                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                className="bg-transparent text-6xl font-black text-white w-32 text-center focus:outline-none placeholder:text-gray-700"
                placeholder="5.0"
              />
              <span className="text-2xl text-run-cyan font-bold">km</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[1, 3, 5, 10, 21.1].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setDistance(dist)}
                  className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                    distance === dist
                      ? 'bg-run-cyan text-[#070b11] shadow-[0_0_10px_rgba(0,255,255,0.4)] scale-105'
                      : 'bg-black/30 text-gray-400 border border-white/5 hover:border-white/20'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* TIME CARD */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Duration</h2>
            
            <div className="flex items-center justify-center gap-4">
              {/* Minutes */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 w-28 relative focus-within:border-run-cyan/50 transition-colors">
                <input
                  type="number"
                  value={minutes || ''}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full bg-transparent text-center text-4xl font-black focus:outline-none placeholder:text-gray-700"
                  placeholder="25"
                />
                <p className="text-center text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">MIN</p>
              </div>
              
              <span className="text-3xl text-gray-600 font-black mb-6">:</span>
              
              {/* Seconds */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 w-28 relative focus-within:border-run-cyan/50 transition-colors">
                <input
                  type="number"
                  value={seconds || ''}
                  onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                  min="0"
                  max="59"
                  className="w-full bg-transparent text-center text-4xl font-black focus:outline-none placeholder:text-gray-700"
                  placeholder="00"
                />
                <p className="text-center text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">SEC</p>
              </div>
            </div>
          </div>

          {/* PACE CARD (NEON GLOW) */}
          {distance > 0 && totalSeconds > 0 && (
            <div className="glass-card bg-run-cyan/[0.02] border border-run-cyan/20 rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-run-cyan/5 blur-xl"></div>
              <h2 className="text-run-cyan/70 text-xs font-bold tracking-widest uppercase mb-2 relative z-10">Average Pace</h2>
              <div className="flex items-baseline gap-2 relative z-10">
                <span 
                  className="text-5xl font-black text-white"
                  style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.4)' }}
                >
                  {formatPace(pace)}
                </span>
                <span className="text-run-cyan/70 font-bold">/km</span>
              </div>
            </div>
          )}

          {/* RATING & EFFORT (COMBINED PANEL) */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-8">
            
            {/* Stars */}
            <div>
              <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Run Rating</h2>
              <div className="flex items-center justify-between px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={40}
                      className={`transition-all duration-300 ${
                        star <= rating
                          ? 'fill-run-cyan text-run-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                          : 'fill-black/30 text-white/10'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && (
                <p className="text-center text-xs text-red-400/80 mt-3 font-semibold">
                  ⚠️ Required to save
                </p>
              )}
            </div>

            <div className="h-[1px] w-full bg-white/5"></div>

            {/* Effort Slider */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 bg-white/[0.01]">
              <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-center">Perceived Effort (RPE)</h3>
              
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3 px-1 uppercase tracking-wider">
                <span>Easy</span>
                <span className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(0,250,255,0.4)]">{effort}</span>
                <span>Maximal</span>
              </div>
              
              <div className="relative w-full h-6 flex items-center mb-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effort}
                  onChange={(e) => setEffort(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-5 
                    [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.8)]
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-run-cyan
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:active:scale-125
                    
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.8)]
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-run-cyan
                    [&::-moz-range-thumb]:transition-transform
                    [&::-moz-range-thumb]:active:scale-125"
                  style={{
                    background: `linear-gradient(to right, #00f0ff ${((effort - 1) / 9) * 100}%, rgba(255,255,255,0.05) ${((effort - 1) / 9) * 100}%)`
                  }}
                />
              </div>
              
              {/* Numbers Underneath */}
              <div className="flex justify-between text-[10px] font-bold text-gray-600 px-1 select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <span 
                    key={n} 
                    className={`transition-all duration-150 ${
                      effort === n 
                        ? "text-run-cyan font-black scale-110 drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]" 
                        : ""
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* NOTES CARD */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the run feel? Weather?"
              rows={3}
              className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-run-cyan/30 resize-none placeholder:text-gray-600"
            />
          </div>

        </div>
      </div>
    </PageLayout>
  )
}