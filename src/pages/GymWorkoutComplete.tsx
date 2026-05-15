import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Star, Trophy, Clock, TrendingUp, Flame, Save } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { WorkoutSession } from '../lib/workoutSession'

export function GymWorkoutComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  console.log('📦 Received location.state:', location.state)
  
  const session = location.state?.session as WorkoutSession | undefined
  console.log('📦 Session:', session)

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
      alert('Please rate your workout!')
      return
    }

    setSaving(true)

    try {
      // Create workout session
        const { data: workoutSession, error: sessionError } = await supabase
            .from('workout_sessions')
            .insert({
                user_id: user.id,
                template_id: session!.template_id,  // ← ! tells TS "trust me, it exists"
                workout_type_id: 1,
                date: typeof session!.started_at === 'string' 
                ? session!.started_at 
                : session!.started_at.toISOString(),
                duration: duration * 60,
                rating,
                perceived_effort: effort,
                notes: notes.trim() || null,
            })
            .select()
            .single()

      if (sessionError) throw sessionError

      // Log all completed sets
      const setLogs = session!.exercises.flatMap(ex =>
        ex.sets
          .filter(set => set.completed)
          .map((set, index) => ({
            session_id: workoutSession.id,
            exercise_id: ex.exercise_id,
            set_number: index + 1,
            reps: set.reps || null,
            weight: set.weight || null,
            rest_time: null, // TODO: track if needed
          }))
      )

      const { error: setsError } = await supabase
        .from('session_exercises')
        .insert(setLogs)

      if (setsError) throw setsError

      // Success!
      navigate('/gym', { 
        state: { 
          message: 'Workout saved! Great job! 💪' 
        } 
      })
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Error saving workout. Please try again.')
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
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-8">
        
        {/* Celebration Header */}
        <div className="relative px-4 pt-8 pb-12 text-center overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gym-orange/20 rounded-full blur-3xl -z-10 animate-pulse" />
          
          <div className="relative inline-block mb-6 animate-scale-in">
            <div className="absolute inset-0 bg-gym-orange/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 bg-gym-gradient rounded-full flex items-center justify-center mx-auto shadow-glow-orange">
              <Trophy size={64} strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-3 animate-slide-up">
            Workout Complete! 🎉
          </h1>
          <p className="text-xl text-gray-400 animate-fade-in">
            {session.template_name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card text-center">
              <Clock className="mx-auto mb-2 text-gym-orange" size={24} />
              <p className="text-2xl font-black mb-1">{duration}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>

            <div className="stat-card text-center">
              <TrendingUp className="mx-auto mb-2 text-run-cyan" size={24} />
              <p className="text-2xl font-black mb-1">{totalSets}</p>
              <p className="text-xs text-gray-500">Sets</p>
            </div>

            <div className="stat-card text-center">
              <Flame className="mx-auto mb-2 text-success-green" size={24} />
              <p className="text-2xl font-black mb-1">{Math.round(totalVolume)}</p>
              <p className="text-xs text-gray-500">kg Volume</p>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="px-4 space-y-6">
          {/* Star Rating */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-center">How was your workout?</h3>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-all active:scale-95"
                >
                  <Star
                    size={48}
                    className={`transition-colors ${
                      star <= rating
                        ? 'fill-gym-orange text-gym-orange'
                        : 'fill-transparent text-gray-600'
                    }`}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-gray-400 text-sm mt-3">
                {rating === 5 && '🔥 Beast mode!'}
                {rating === 4 && '💪 Strong session!'}
                {rating === 3 && '👍 Solid work!'}
                {rating === 2 && '😅 Better than nothing!'}
                {rating === 1 && '🤕 Tough day?'}
              </p>
            )}
          </div>

          {/* Effort Scale (RPE) */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-center">Perceived Effort (RPE)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Very Easy</span>
                <span className="text-2xl font-black text-gym-orange">{effort}</span>
                <span>Max Effort</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={effort}
                onChange={(e) => setEffort(parseInt(e.target.value))}
                className="w-full h-3 accent-gym-orange cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any PRs? Soreness?"
              rows={4}
              className="input-field resize-none text-sm"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || rating === 0}
            className="w-full btn-primary-gym flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={24} />
            {saving ? 'Saving...' : 'Save Workout'}
          </button>

          {rating === 0 && (
            <p className="text-center text-sm text-red-400">
              ⚠️ Please rate your workout before saving
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  )
}