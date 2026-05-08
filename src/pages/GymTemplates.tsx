import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface WorkoutTemplate {
  id: number
  name: string
  description: string | null
  created_at: string
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
        .select('*')
        .eq('user_id', user.id)
        .eq('workout_type_id', 1)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error:', error)
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
          className="w-10 h-10 bg-gym-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gym-orange/30 active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker">
        {/* Stats Header */}
        <div className="px-4 pt-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card text-center">
              <p className="text-2xl font-black text-gym-orange mb-1">8</p>
              <p className="text-xs text-gray-500">Treninga</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-black text-run-cyan mb-1">45</p>
              <p className="text-xs text-gray-500">Vežbi</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-black text-success-green mb-1">156</p>
              <p className="text-xs text-gray-500">Setova</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3 pb-24">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 px-4 animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gym-orange/20 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 bg-gym-gradient rounded-full flex items-center justify-center mx-auto">
                  <Dumbbell size={48} strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Nemaš još treninga</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                Kreiraj svoj prvi workout plan i započni transformaciju!
              </p>
              <button
                onClick={() => navigate('/gym/new')}
                className="btn-primary-gym inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Kreiraj prvi trening
              </button>
            </div>
          ) : (
            templates.map((template, index) => (
              <button
                key={template.id}
                onClick={() => navigate(`/gym/template/${template.id}`)}
                className="w-full group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gym-gradient opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                  
                  <div className="glass-card p-5 group-active:scale-98 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gym-orange/30 rounded-xl blur-lg" />
                        <div className="relative w-14 h-14 bg-gym-gradient rounded-xl flex items-center justify-center">
                          <Dumbbell size={24} strokeWidth={2.5} />
                        </div>
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-bold text-lg mb-1 truncate">{template.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            12 vežbi
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            ~45 min
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="text-gray-600 flex-shrink-0 group-hover:text-gym-orange transition-colors" size={20} />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}