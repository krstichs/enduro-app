import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, GripVertical, Trash2, Check } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { ExerciseSelector } from '../components/gym/ExerciseSelector'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
}

interface TemplateExercise {
  exercise: Exercise
  order_num: number
  target_sets: number
  target_reps: number
}

export function GymTemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [templateName, setTemplateName] = useState('')
  const [exercises, setExercises] = useState<TemplateExercise[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<any>(null)


  useEffect(() => {
    if (id) {
      fetchTemplate()
    }
  }, [id])

  async function fetchTemplate() {
     if (!id) return   

    try {
        // Fetch template WITH settings
        const { data: templateData, error: templateError } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', id)
        .single()

        if (templateError) throw templateError
    setTemplate(templateData)

      // Fetch exercises
      const { data: templateExercises, error: exercisesError } = await supabase
        .from('template_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('template_id', id)
        .order('order_num')

      if (exercisesError) throw exercisesError

      const formattedExercises = templateExercises.map((te: any) => ({
        exercise: te.exercise,
        order_num: te.order_num,
        target_sets: te.target_sets || 3,
        target_reps: te.target_reps || 10,
      }))

      setExercises(formattedExercises)
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  function handleAddExercise(exercise: Exercise) {
    if (!exercise) {
      setShowSelector(false)
      return
    }

    const newExercise: TemplateExercise = {
      exercise,
      order_num: exercises.length,
      target_sets: 3,
      target_reps: 10,
    }

    setExercises([...exercises, newExercise])
    setShowSelector(false)
  }

  function handleRemoveExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  function updateExercise(index: number, field: 'target_sets' | 'target_reps', value: number) {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  async function handleSave() {
    if (!user || !id) return

    setSaving(true)

    try {
      // Delete existing exercises
      await supabase
        .from('template_exercises')
        .delete()
        .eq('template_id', id)

      // Insert new exercises
      const exercisesToInsert = exercises.map((ex, index) => ({
        template_id: parseInt(id),
        exercise_id: ex.exercise.id,
        order_num: index,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
      }))

      const { error } = await supabase
        .from('template_exercises')
        .insert(exercisesToInsert)

      if (error) throw error

      navigate('/gym')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving workout')
    } finally {
      setSaving(false)
    }
  }

  const selectedIds = exercises.map(e => e.exercise.id)

  return (
    <>
      <PageLayout
        title={templateName}
        showBack
        headerAction={
          <button
            onClick={handleSave}
            disabled={exercises.length === 0 || saving}
            className="px-4 py-2 bg-gym-gradient rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Check size={18} />
            Save
          </button>
        }
      >
        <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
          <div className="p-4 space-y-4">
            {/* Add Exercise Button */}
            <button
              onClick={() => setShowSelector(true)}
              className="w-full glass-card rounded-2xl p-6 hover:bg-white/10 transition-colors active:scale-98"
            >
              <div className="flex items-center justify-center gap-3 text-gym-orange">
                <Plus size={24} strokeWidth={2.5} />
                <span className="font-semibold text-lg">Add Exercise</span>
              </div>
            </button>

            {/* Exercise List */}
            {exercises.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-xl font-bold mb-2">No exercises yet</h3>
                <p className="text-gray-400">Add exercises to build your workout</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, index) => (
                  <div
                    key={`${ex.exercise.id}-${index}`}
                    className="glass-card rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="pt-1 text-gray-500 cursor-move">
                        <GripVertical size={20} />
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{ex.exercise.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {ex.exercise.muscle_group}
                        </p>

                        {/* Sets & Reps */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Sets:</label>
                            <input
                              type="number"
                              value={ex.target_sets}
                              onChange={(e) => updateExercise(index, 'target_sets', parseInt(e.target.value) || 0)}
                              className="w-16 px-3 py-1.5 bg-enduro-dark border border-white/10 rounded-lg text-center focus:outline-none focus:border-gym-orange/50"
                              min="1"
                            />
                          </div>

                        {/* Tracking Options */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {template?.track_weight && (
                                <span className="px-2 py-1 bg-gym-orange/20 text-gym-orange text-xs rounded-lg font-medium">
                                Weight
                                </span>
                            )}
                            {template?.track_reps && (
                                <span className="px-2 py-1 bg-run-cyan/20 text-run-cyan text-xs rounded-lg font-medium">
                                Reps
                                </span>
                            )}
                            {template?.track_time && (
                                <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-lg font-medium">
                                Time
                                </span>
                            )}
                        </div>

                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Reps:</label>
                            <input
                              type="number"
                              value={ex.target_reps}
                              onChange={(e) => updateExercise(index, 'target_reps', parseInt(e.target.value) || 0)}
                              className="w-16 px-3 py-1.5 bg-enduro-dark border border-white/10 rounded-lg text-center focus:outline-none focus:border-gym-orange/50"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {/* Exercise Selector Modal */}
      {showSelector && (
        <ExerciseSelector
          onSelect={handleAddExercise}
          selectedIds={selectedIds}
        />
      )}
    </>
  )
}