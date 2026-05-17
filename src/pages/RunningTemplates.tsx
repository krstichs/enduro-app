import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Activity, Clock, MapPin, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RunningTemplate {
  id: number
  name: string
  description: string | null
  workout_type: string
  target_distance: number
  target_duration: number | null
  notes: string | null
}

const workoutTypeLabels: Record<string, { label: string; emoji: string }> = {
  easy: { label: 'Easy Run', emoji: '😌' },
  tempo: { label: 'Tempo Run', emoji: '⚡' },
  long_run: { label: 'Long Run', emoji: '🎯' },
  interval: { label: 'Interval', emoji: '🔥' },
  recovery: { label: 'Recovery', emoji: '💆' },
}

export function RunningTemplates() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [templates, setTemplates] = useState<RunningTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('running_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    return `~${mins} min`
  }

  return (
    <PageLayout 
      title="Running Plans"
      headerAction={
        <button
          onClick={() => navigate('/running/new')}
          className="w-10 h-10 bg-gradient-to-r from-run-cyan to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.4)] active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} className="text-[#070b11]" />
        </button>
      }
    >
      <div className="min-h-screen bg-[#070b11] pb-24 text-white font-sans">
        
        {/* Quick Log Hero Button */}
        <div className="p-4 pt-6">
          <button
            onClick={() => navigate('/running/log')}
            className="w-full relative overflow-hidden rounded-[32px] group active:scale-95 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-run-cyan to-blue-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            
            <div className="relative p-6 flex flex-col items-center justify-center gap-2">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-1 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Activity size={32} strokeWidth={2.5} className="text-[#070b11]" />
              </div>
              <h2 className="text-2xl font-black text-[#070b11] tracking-tight">QUICK LOG RUN</h2>
            </div>
          </button>
        </div>

        {/* Templates List */}
        <div className="px-4 space-y-4">
          <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-4 mb-2 ml-2">My Saved Plans</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-run-cyan/20 border-t-run-cyan rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 px-4 glass-card bg-white/[0.02] border border-white/5 rounded-[32px]">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-run-cyan/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                  <Activity size={36} className="text-run-cyan opacity-80" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">No plans yet</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                Create a preset plan for your regular routes, or use Quick Log to just run.
              </p>
              <button
                onClick={() => navigate('/running/new')}
                className="px-6 py-3 bg-white/5 border border-run-cyan/30 text-run-cyan rounded-full font-bold active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => navigate(`/running/template/${template.id}`)}
                  className="w-full text-left bg-white/[0.03] border border-white/10 p-5 rounded-[28px] flex items-center gap-5 active:scale-[0.98] transition-all hover:bg-white/[0.05]"
                >
                  {/* Glowing Emoji Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-run-cyan/20 rounded-2xl blur-md" />
                    <div className="relative w-14 h-14 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center text-2xl z-10">
                      {workoutTypeLabels[template.workout_type]?.emoji || '🏃'}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{template.name}</h3>
                    
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1 text-white bg-white/5 px-2 py-1 rounded-md">
                        <MapPin size={12} className="text-run-cyan" />
                        {template.target_distance} km
                      </span>
                      
                      {template.target_duration && (
                        <span className="flex items-center gap-1 text-white bg-white/5 px-2 py-1 rounded-md">
                          <Clock size={12} className="text-run-cyan" />
                          {formatDuration(template.target_duration)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] uppercase tracking-widest text-run-cyan mt-2 font-bold opacity-80">
                      {workoutTypeLabels[template.workout_type]?.label || template.workout_type}
                    </p>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="text-gray-500" size={18} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}