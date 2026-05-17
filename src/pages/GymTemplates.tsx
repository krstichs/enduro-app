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
      title=""
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
              <p className="text-xs text-gray-500">Workouts</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-black text-run-cyan mb-1">45</p>
              <p className="text-xs text-gray-500">Exercises</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-black text-success-green mb-1">156</p>
              <p className="text-xs text-gray-500">Sets</p>
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
              <h3 className="text-2xl font-bold mb-3">No workouts yet</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                Create your first workout plan and start your transformation!
              </p>
              <button
                onClick={() => navigate('/gym/new')}
                className="btn-primary-gym inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create First Workout
              </button>
            </div>
          ) : (
          templates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => navigate(`/gym/template/${template.id}`)}
              className="w-full group animate-slide-up text-left block"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group-active:scale-[0.99]">
                {/* Glow koji se pali na hover */}
                <div className="absolute inset-0 bg-gym-gradient opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300" />
                
                {/* Leva svetleća linija obeleživač */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gym-gradient opacity-70 group-hover:opacity-100 transition-opacity" />

                <div className="glass-card p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gym-orange/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                      <div className="relative w-12 h-12 bg-gym-gradient rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,114,0,0.2)]">
                        <Dumbbell size={20} strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pl-1">
                      <h3 className="font-bold text-lg text-white mb-1 group-hover:text-gym-orange transition-colors truncate">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={13} className="text-gym-orange/70" />
                          12 exercises
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gym-orange/70" />
                          ~45 min
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="text-gray-600 flex-shrink-0 group-hover:text-gym-orange group-hover:translate-x-0.5 transition-all" size={18} />
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