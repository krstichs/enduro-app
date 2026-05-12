import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, Edit, Trash2, Dumbbell, TrendingUp, Clock, Timer } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
}

interface TemplateExercise {
  id: number
  exercise: Exercise
  order_num: number
  target_sets: number
  target_reps: number
}

interface WorkoutTemplate {
  id: number
  name: string
  description: string | null
  created_at: string
  track_weight?: boolean
  track_reps?: boolean
  track_time?: boolean
  track_distance?: boolean
  auto_rest_timer?: boolean
  default_rest_seconds?: number
}

export function GymTemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)
  const [exercises, setExercises] = useState<TemplateExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [id])

  async function fetchTemplate() {
    if (!id) return

    try {
      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (templateError) throw templateError
      setTemplate(templateData)

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('template_exercises')
        .select(`
          id,
          order_num,
          target_sets,
          target_reps,
          exercise:exercises(*)
        `)
        .eq('template_id', id)
        .order('order_num')

      if (exercisesError) throw exercisesError

      setExercises(exercisesData.map((te: any) => ({
        id: te.id,
        exercise: te.exercise,
        order_num: te.order_num,
        target_sets: te.target_sets,
        target_reps: te.target_reps,
      })))
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this workout?')) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/gym')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting workout')
    } finally {
      setDeleting(false)
    }
  }

  function handleStartWorkout() {
    navigate(`/gym/workout/${id}/start`)
  }

  if (loading) {
    return (
      <PageLayout showBack>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!template) {
    return (
      <PageLayout showBack>
        <div className="text-center py-16">
          <p className="text-gray-400">Workout not found</p>
        </div>
      </PageLayout>
    )
  }

  const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0)
  const estimatedTime = exercises.length * 5

  return (
    <PageLayout
      title={template.name}
      showBack
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/gym/template/${id}/edit`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit size={20} />
          </button>
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
        {/* Stats Cards */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card text-center">
              <Dumbbell className="mx-auto mb-2 text-gym-orange" size={24} />
              <p className="text-2xl font-black mb-1">{exercises.length}</p>
              <p className="text-xs text-gray-500">Exercises</p>
            </div>

            <div className="stat-card text-center">
              <TrendingUp className="mx-auto mb-2 text-run-cyan" size={24} />
              <p className="text-2xl font-black mb-1">{totalSets}</p>
              <p className="text-xs text-gray-500">Total Sets</p>
            </div>

            <div className="stat-card text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-2xl font-black mb-1">~{estimatedTime}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
          </div>

          {/* Tracking Settings Badge */}
          {(template.track_weight || template.track_reps || template.track_time || template.auto_rest_timer) && (
            <div className="glass-card rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Tracking</h4>
              <div className="flex flex-wrap gap-2">
                {template.track_weight && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-gym-orange/20 text-gym-orange rounded-lg text-sm font-medium">
                    <Dumbbell size={14} />
                    Weight
                  </span>
                )}
                {template.track_reps && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-run-cyan/20 text-run-cyan rounded-lg text-sm font-medium">
                    <TrendingUp size={14} />
                    Reps
                  </span>
                )}
                {template.track_time && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-accent-purple/20 text-accent-purple rounded-lg text-sm font-medium">
                    <Clock size={14} />
                    Time
                  </span>
                )}
                {template.auto_rest_timer && template.default_rest_seconds && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-success-green/20 text-success-green rounded-lg text-sm font-medium">
                    <Timer size={14} />
                    Rest Timer ({Math.floor(template.default_rest_seconds / 60)}:{(template.default_rest_seconds % 60).toString().padStart(2, '0')})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Start Workout Button */}
          <button
            onClick={handleStartWorkout}
            className="w-full btn-primary-gym flex items-center justify-center gap-3 py-4 text-lg"
          >
            <Play size={24} fill="currentColor" />
            Start Workout
          </button>

          {/* Exercise List */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-bold px-1">Exercises</h3>
            
            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No exercises added yet</p>
                <button
                  onClick={() => navigate(`/gym/template/${id}/edit`)}
                  className="text-gym-orange hover:text-gym-orange-dark font-semibold"
                >
                  Add exercises
                </button>
              </div>
            ) : (
              exercises.map((ex, index) => (
                <div
                  key={ex.id}
                  className="glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Exercise Number */}
                    <div className="w-10 h-10 bg-gym-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-gym-orange">{index + 1}</span>
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1">{ex.exercise.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{ex.exercise.muscle_group}</span>
                        <span>•</span>
                        <span>{ex.exercise.equipment}</span>
                      </div>
                    </div>

                    {/* Sets x Reps */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold">
                        {ex.target_sets} <span className="text-gray-500">×</span> {ex.target_reps}
                      </p>
                      <p className="text-xs text-gray-500">sets × reps</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Description */}
          {template.description && (
            <div className="glass-card rounded-2xl p-4 mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
              <p className="text-gray-300">{template.description}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}