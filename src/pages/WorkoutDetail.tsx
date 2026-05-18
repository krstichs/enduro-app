import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Dumbbell, Activity, Star, Calendar, Clock, Trash2, Repeat } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface WorkoutDetail {
  id: number
  date: string
  duration: number
  rating: number
  perceived_effort: number
  notes: string | null
  workout_type_id: number
  workout_template: { id: number; name: string } | null
  session_exercises: Array<{
    exercise: { name: string; muscle_group: string }
    set_number: number
    weight: number | null
    reps: number | null
    rest_time: number | null
  }>
  running_sessions: Array<{
    distance: number
    duration: number
    pace: number
  }>
}

export function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchWorkoutDetail()
  }, [id])

  async function fetchWorkoutDetail() {
    if (!id || !user) return

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_template:workout_templates(id, name),
          session_exercises(
            *,
            exercise:exercises(name, muscle_group)
          ),
          running_sessions(distance, duration, pace)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setWorkout(data)
    } catch (error) {
      console.error('Error fetching workout:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this workout?')) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/profile', { 
        state: { message: 'Workout deleted' }
      })
    } catch (error) {
      console.error('Error deleting workout:', error)
      alert('Error deleting workout')
    } finally {
      setDeleting(false)
    }
  }

  function handleRepeat() {
    if (workout?.workout_template) {
      navigate(`/gym/workout/${workout.workout_template.id}/start`)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatPace(pace: number) {
    const mins = Math.floor(pace)
    const secs = Math.round((pace - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <PageLayout showBack title="Workout Details">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!workout) {
    return (
      <PageLayout showBack title="Workout Details">
        <div className="text-center py-16">
          <p className="text-gray-400">Workout not found</p>
        </div>
      </PageLayout>
    )
  }

  const isGym = workout.workout_type_id === 1
  const totalVolume = workout.session_exercises?.reduce((sum, ex) => {
    return sum + ((ex.weight || 0) * (ex.reps || 0))
  }, 0) || 0

  // Group exercises by exercise name
  const groupedExercises = workout.session_exercises?.reduce((acc, ex) => {
    const key = ex.exercise.name
    if (!acc[key]) {
      acc[key] = {
        name: ex.exercise.name,
        muscle_group: ex.exercise.muscle_group,
        sets: []
      }
    }
    acc[key].sets.push(ex)
    return acc
  }, {} as Record<string, any>)

  return (
    <PageLayout 
      showBack
      title={workout.workout_template?.name || (isGym ? 'Gym Workout' : 'Running')}
      headerAction={
        <div className="flex items-center gap-2">
          {workout.workout_template && (
            <button
              onClick={handleRepeat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Repeat size={20} className="text-gym-orange" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={20} className="text-red-400" />
          </button>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        
        {/* Header Info */}
        <div className="p-4 space-y-4">
          {/* Date & Time */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="font-semibold">{formatDate(workout.date)}</p>
                  <p className="text-sm text-gray-400">{formatTime(workout.date)}</p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: workout.rating }).map((_, i) => (
                  <Star key={i} size={20} className="fill-gym-orange text-gym-orange" />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card text-center">
              <Clock className="mx-auto mb-2 text-gym-orange" size={24} />
              <p className="text-2xl font-black mb-1">{Math.round(workout.duration / 60)}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>

            {isGym ? (
              <>
                <div className="stat-card text-center">
                  <Dumbbell className="mx-auto mb-2 text-gym-orange" size={24} />
                  <p className="text-2xl font-black mb-1">
                    {workout.session_exercises?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Sets</p>
                </div>

                <div className="stat-card text-center">
                  <div className="text-2xl mb-2">💪</div>
                  <p className="text-2xl font-black mb-1">{Math.round(totalVolume)}</p>
                  <p className="text-xs text-gray-500">kg Volume</p>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card text-center">
                  <Activity className="mx-auto mb-2 text-run-cyan" size={24} />
                  <p className="text-2xl font-black mb-1">
                    {workout.running_sessions?.[0]?.distance?.toFixed(1) || 0}
                  </p>
                  <p className="text-xs text-gray-500">km</p>
                </div>

                <div className="stat-card text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="text-2xl font-black mb-1">
                    {workout.running_sessions?.[0]?.pace 
                      ? formatPace(workout.running_sessions[0].pace)
                      : '--'}
                  </p>
                  <p className="text-xs text-gray-500">min/km</p>
                </div>
              </>
            )}
          </div>

          {/* Effort */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Perceived Effort (RPE)</span>
              <span className="text-2xl font-black text-gym-orange">{workout.perceived_effort}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gym-gradient rounded-full transition-all"
                style={{ width: `${(workout.perceived_effort / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Exercise Details (Gym only) */}
          {isGym && groupedExercises && Object.values(groupedExercises).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold px-1">Exercises</h3>
              
              {Object.values(groupedExercises).map((exercise: any, idx: number) => (
                <div key={idx} className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gym-orange/20 rounded-xl flex items-center justify-center">
                      <span className="font-bold text-gym-orange">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <p className="text-sm text-gray-400">{exercise.muscle_group}</p>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 text-xs text-gray-500 font-semibold px-2">
                      <span>Set</span>
                      <span className="text-center">Weight</span>
                      <span className="text-center">Reps</span>
                      <span className="text-right">Volume</span>
                    </div>
                    
                    {exercise.sets.map((set: any, setIdx: number) => (
                      <div key={setIdx} className="grid grid-cols-4 bg-white/5 rounded-lg p-2 text-sm">
                        <span className="text-gray-400">{set.set_number}</span>
                        <span className="text-center font-semibold">
                          {set.weight ? `${set.weight} kg` : '-'}
                        </span>
                        <span className="text-center font-semibold">
                          {set.reps || '-'}
                        </span>
                        <span className="text-right text-gym-orange font-semibold">
                          {set.weight && set.reps ? `${set.weight * set.reps} kg` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {workout.notes && (
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Notes</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}