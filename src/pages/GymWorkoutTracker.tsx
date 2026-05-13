import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { SetLogger } from '../components/gym/SetLogger'
import { RestTimer } from '../components/gym/RestTimer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { initializeWorkoutSession, type WorkoutSession } from '../lib/workoutSession'

export function GymWorkoutTracker() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeSession()
  }, [id])

  async function initializeSession() {
    if (!id) return

    try {
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (templateError) throw templateError

      const { data: exercises, error: exercisesError } = await supabase
        .from('template_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('template_id', id)
        .order('order_num')

      if (exercisesError) throw exercisesError

      const sessionData = initializeWorkoutSession(template, exercises)
      setSession(sessionData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSetComplete(data: { weight?: number; reps?: number; time?: number }) {
    if (!session) return

    const updated = { ...session }
    const currentExercise = updated.exercises[updated.currentExerciseIndex]
    const currentSet = currentExercise.sets[currentExercise.currentSet]

    // Log set data
    currentSet.weight = data.weight
    currentSet.reps = data.reps
    currentSet.time = data.time
    currentSet.completed = true

    // Move to next set
    if (currentExercise.currentSet < currentExercise.target_sets - 1) {
      currentExercise.currentSet++
      setSession(updated)

      // Show rest timer if enabled
      if (session.auto_rest_timer) {
        setShowRestTimer(true)
      }
    } else {
      // Exercise complete
      currentExercise.completed = true
      
      // Move to next exercise or finish
      if (updated.currentExerciseIndex < updated.exercises.length - 1) {
        updated.currentExerciseIndex++
        setSession(updated)
      } else {
        // Workout complete!
        handleWorkoutComplete()
      }
    }
  }

  function handleRestComplete() {
    setShowRestTimer(false)
  }

  function handleRestSkip() {
    setShowRestTimer(false)
  }

  async function handleWorkoutComplete() {
    // Navigate to completion screen
    navigate(`/gym/workout/${id}/complete`, { state: { session } })
  }

  function handleQuit() {
    if (window.confirm('Are you sure you want to quit? Progress will be lost.')) {
      navigate('/gym')
    }
  }

  if (loading || !session) {
    return (
      <PageLayout showBack showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  const currentExercise = session.exercises[session.currentExerciseIndex]
  const currentSetNumber = currentExercise.currentSet + 1
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.target_sets, 0)
  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
    0
  )
  const progress = (completedSets / totalSets) * 100

  return (
    <>
      <PageLayout
        title={session.template_name}
        showBack={false}
        showBottomNav={false}
        headerAction={
          <button
            onClick={handleQuit}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-red-400" />
          </button>
        }
      >
        <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-8">
        
        {/* Progress Bar */}
        <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-semibold text-enduro-light">
            Progress ({Math.round(progress)}%)
            </span>
            <span className="font-bold">
            <span className="text-gym-orange">{completedSets}</span>
            <span className="text-gray-500"> / {totalSets} sets</span>
            </span>
        </div>
        
        {/* Progress Bar Track */}
<div className="relative h-4 bg-enduro-gray-light rounded-full overflow-hidden border border-white/5 shadow-inner">
    {/* Real Orange Fill */}
    <div
        className="h-full bg-gym-orange transition-all duration-700 ease-out rounded-full relative shadow-[0_0_15px_rgba(255,165,0,0.5)]" 
        style={{ width: `${progress}%` }}
    >
        {/* Unutrašnji sjaj (Shine) za dubinu */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        
        {/* Pokretni odsjaj */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
    
    {/* Outer Glow (Spoljni sjaj koji prati progres) */}
    <div
        className="absolute inset-y-0 left-0 bg-gym-orange opacity-40 blur-md transition-all duration-700 ease-out pointer-events-none"
        style={{ width: `${progress}%` }}
    />
</div>
        
        </div>

          {/* Exercise Info */}
          <div className="px-4 mb-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  disabled={session.currentExerciseIndex === 0}
                  className="p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="text-center flex-1">
                  <p className="text-sm text-gray-400 mb-1">
                    Exercise {session.currentExerciseIndex + 1} of {session.exercises.length}
                  </p>
                  <h2 className="text-2xl font-bold">{currentExercise.exercise_name}</h2>
                </div>

                <button
                  disabled={session.currentExerciseIndex === session.exercises.length - 1}
                  className="p-2 disabled:opacity-30"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Sets Progress */}
              <div className="flex items-center justify-center gap-2">
                {currentExercise.sets.map((set, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                      set.completed
                        ? 'bg-success-green text-white'
                        : i === currentExercise.currentSet
                        ? 'bg-gym-gradient text-white'
                        : 'bg-white/10 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Set Logger */}
          <div className="px-4">
            <SetLogger
              setNumber={currentSetNumber}
              targetReps={currentExercise.target_reps}
              trackWeight={session.track_weight}
              trackReps={session.track_reps}
              trackTime={session.track_time}
              onComplete={handleSetComplete}
            />
          </div>
        </div>
      </PageLayout>

      {/* Rest Timer Overlay */}
      {showRestTimer && (
        <RestTimer
          totalSeconds={session.default_rest_seconds}
          onComplete={handleRestComplete}
          onSkip={handleRestSkip}
        />
      )}
    </>
  )
}