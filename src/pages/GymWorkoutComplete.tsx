import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Star, Trophy, Clock, TrendingUp, Flame, Save } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { WorkoutSession } from '../lib/workoutSession'
import { useToast } from '../contexts/ToastContext'

export function GymWorkoutComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const session = location.state?.session as WorkoutSession | undefined

  const [rating, setRating] = useState<number>(0)
  const [effort, setEffort] = useState<number>(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  if (!session) {
    return (
      <PageLayout title="Error" showBack>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
          <p className="text-gray-400 mb-6">
            Something went wrong. Your workout data is missing.
          </p>
          <button
            onClick={() => navigate('/gym')}
            className="btn-primary-gym"
          >
            Back to Gym
          </button>
        </div>
      </PageLayout>
    )
  }

  const duration = Math.round(
    (new Date().getTime() - new Date(session.started_at).getTime()) / 1000 / 60
  )  
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)
  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((setSum, set) => {
      if (set.completed && set.weight && set.reps) {
        return setSum + (set.weight * set.reps)
      }
      return setSum
    }, 0),
    0
  )

  async function handleSave() {
    if (!user || rating === 0) {
      showToast('Please rate your workout!', 'warning')
      return
    }

    if (!session) return

    setSaving(true)

    try {
      const { data: workoutSession, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          template_id: session.template_id,
          workout_type_id: 1,
          date: typeof session.started_at === 'string' 
            ? session.started_at 
            : session.started_at.toISOString(),
          duration: duration * 60,
          rating,
          perceived_effort: effort,
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      const setLogs = session.exercises.flatMap(ex =>
        ex.sets
          .filter(set => set.completed)
          .map((set, index) => ({
            session_id: workoutSession.id,
            exercise_id: ex.exercise_id,
            set_number: index + 1,
            reps: set.reps || null,
            weight: set.weight || null,
            rest_time: null,
          }))
      )

      const { error: setsError } = await supabase
        .from('session_exercises')
        .insert(setLogs)

      if (setsError) throw setsError

      showToast('Workout saved! Great job! 💪', 'success')
      
      setTimeout(() => {
        navigate('/gym')
      }, 1000)
    } catch (error) {
      console.error('Error saving workout:', error)
      showToast('Error saving workout. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="Workout Complete!" 
      showBack={false}
      showBottomNav={false}
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-12">
        
        {/* Celebration Header */}
        <div className="relative px-4 pt-8 pb-10 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gym-orange/10 rounded-full blur-3xl -z-10 animate-pulse" />
          
          <div className="relative inline-block mb-6 animate-scale-in">
            <div className="absolute inset-0 bg-gym-orange/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-28 h-28 bg-gym-gradient rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,114,0,0.4)] border border-white/10">
              <Trophy size={48} strokeWidth={2} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Workout Complete! 🎉
          </h1>
          <p className="text-lg font-medium text-gym-orange drop-shadow-[0_0_10px_rgba(255,114,0,0.2)]">
            {session.template_name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center border border-white/5 bg-white/[0.02]">
              <Clock className="mx-auto mb-2 text-gym-orange drop-shadow-[0_0_8px_rgba(255,114,0,0.3)]" size={22} />
              <p className="text-2xl font-black mb-0.5 text-white">{duration}</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Minutes</p>
            </div>

            <div className="glass-card rounded-2xl p-4 text-center border border-white/5 bg-white/[0.02]">
              <TrendingUp className="mx-auto mb-2 text-gym-orange drop-shadow-[0_0_8px_rgba(255,114,0,0.3)]" size={22} />
              <p className="text-2xl font-black mb-0.5 text-white">{totalSets}</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sets</p>
            </div>

            <div className="glass-card rounded-2xl p-4 text-center border border-white/5 bg-white/[0.02]">
              <Flame className="mx-auto mb-2 text-gym-orange drop-shadow-[0_0_8px_rgba(255,114,0,0.3)]" size={22} />
              <p className="text-2xl font-black mb-0.5 text-white">{Math.round(totalVolume)}</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">kg Volume</p>
            </div>
          </div>
        </div>

        {/* Rating & Effort Sections */}
        <div className="px-4 space-y-4">
          
          {/* Star Rating */}
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest text-center">How was your workout?</h3>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90 p-1"
                >
                  <Star
                    size={40}
                    className={`transition-all duration-200 ${
                      star <= rating
                        ? 'fill-gym-orange text-gym-orange drop-shadow-[0_0_12px_rgba(255,114,0,0.6)]'
                        : 'fill-transparent text-gray-600'
                    }`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-white text-sm font-semibold mt-3 animate-fade-in">
                {rating === 5 && '🔥 Beast mode!'}
                {rating === 4 && '💪 Strong session!'}
                {rating === 3 && '👍 Solid work!'}
                {rating === 2 && '😅 Better than nothing!'}
                {rating === 1 && '🤕 Tough day?'}
              </p>
            )}
          </div>

          {/* Fixed Effort Slider (RPE) */}
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-center">Perceived Effort (RPE)</h3>
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3 px-1 uppercase tracking-wider">
              <span>Easy</span>
              <span className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(255,114,0,0.4)]">{effort}</span>
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
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,114,0,0.8)]
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-gym-orange
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:active:scale-125
                  
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(255,114,0,0.8)]
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-gym-orange
                  [&::-moz-range-thumb]:transition-transform
                  [&::-moz-range-thumb]:active:scale-125"
                style={{
                  background: `linear-gradient(to right, #ff7200 ${((effort - 1) / 9) * 100}%, rgba(255,255,255,0.05) ${((effort - 1) / 9) * 100}%)`
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-600 px-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <span key={n} className={effort === n ? "text-gym-orange font-black" : ""}>{n}</span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any PRs? Soreness?"
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gym-orange/50 focus:shadow-[0_0_15px_rgba(255,114,0,0.15)] transition-all resize-none placeholder:text-gray-600"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || rating === 0}
            className="w-full bg-gym-gradient text-white font-bold flex items-center justify-center gap-3 py-4 text-lg rounded-2xl active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,114,0,0.15)]"
          >
            <Save size={22} />
            {saving ? 'Saving...' : 'Save Workout'}
          </button>

          {rating === 0 && (
            <p className="text-center text-xs font-semibold text-red-400 tracking-wide mt-1 animate-pulse">
              ⚠️ Please rate your workout before saving
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  )
}