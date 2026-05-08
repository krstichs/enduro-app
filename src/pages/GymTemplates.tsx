import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface WorkoutTemplate {
  id: number
  name: string
  description: string | null
  created_at: string
  exercise_count?: number
}

export function GymTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          template_exercises(count)
        `)
        .eq('user_id', user.id)
        .eq('workout_type_id', 1) // Gym = 1
        .order('created_at', { ascending: false })

      if (error) throw error

      // Count exercises for each template
      const templatesWithCount = data?.map(t => ({
        ...t,
        exercise_count: t.template_exercises?.[0]?.count || 0
      })) || []

      setTemplates(templatesWithCount)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout 
      title="Gym Workouts"
      headerAction={
        <button
          onClick={() => navigate('/gym/new')}
          className="p-2 bg-gym-orange hover:bg-orange-600 rounded-lg transition-colors"
        >
          <Plus size={24} />
        </button>
      }
    >
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Učitavanje...
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold mb-2">Nemaš još treninga</h3>
            <p className="text-gray-400 mb-6">Kreiraj svoj prvi workout plan!</p>
            <button
              onClick={() => navigate('/gym/new')}
              className="bg-gym-orange hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Kreiraj trening
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => navigate(`/gym/template/${template.id}`)}
                className="w-full bg-enduro-gray border border-gray-700 hover:border-gym-orange rounded-xl p-4 transition-all active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gym-orange/20 rounded-lg flex items-center justify-center">
                      <Dumbbell className="text-gym-orange" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-400">
                        {template.exercise_count} vežbi
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-500" size={20} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}