import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Activity, Star, Calendar, Clock, Trash2, MapPin, Zap } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RunningDetail {
  id: number
  date: string
  duration: number
  rating: number
  perceived_effort: number
  notes: string | null
  running_sessions: Array<{
    distance: number
    duration: number
    pace: number
  }>
}

export function RunningDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [run, setRun] = useState<RunningDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchRunDetail()
  }, [id])

  async function fetchRunDetail() {
    if (!id || !user) return

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          running_sessions(distance, duration, pace)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setRun(data)
    } catch (error) {
      console.error('Error fetching run:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this run?')) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/profile', { 
        state: { message: 'Run deleted' }
      })
    } catch (error) {
      console.error('Error deleting run:', error)
      alert('Error deleting run')
    } finally {
      setDeleting(false)
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

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <PageLayout showBack title="Run Details">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-run-cyan/30 border-t-run-cyan rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!run || !run.running_sessions?.[0]) {
    return (
      <PageLayout showBack title="Run Details">
        <div className="text-center py-16">
          <p className="text-gray-400">Run not found</p>
        </div>
      </PageLayout>
    )
  }

  const runData = run.running_sessions[0]

  return (
    <PageLayout 
      showBack
      title="Running Session"
      headerAction={
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 size={20} className="text-red-400" />
        </button>
      }
    >
      <div className="min-h-screen bg-[#070b11] pb-24 text-white">
        
        {/* Header Info */}
        <div className="p-4 space-y-4">
          {/* Date & Time */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-run-cyan" />
                <div>
                  <p className="font-semibold">{formatDate(run.date)}</p>
                  <p className="text-sm text-gray-400">{formatTime(run.date)}</p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: run.rating }).map((_, i) => (
                  <Star key={i} size={20} className="fill-run-cyan text-run-cyan" />
                ))}
              </div>
            </div>
          </div>

          {/* Main Stats - Big Numbers */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 text-center">
              <MapPin className="mx-auto mb-3 text-run-cyan" size={28} />
              <p className="text-4xl font-black mb-1">{runData.distance.toFixed(1)}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Kilometers</p>
            </div>

            {/* Duration */}
            <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 text-center">
              <Clock className="mx-auto mb-3 text-run-cyan" size={28} />
              <p className="text-4xl font-black mb-1">{formatDuration(runData.duration)}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Time</p>
            </div>
          </div>

          {/* Pace - Hero Card */}
          <div className="glass-card bg-run-cyan/[0.05] border-2 border-run-cyan/30 rounded-[32px] p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-run-cyan/5 blur-xl" />
            <div className="relative z-10">
              <Zap className="mx-auto mb-3 text-run-cyan" size={32} />
              <p className="text-sm text-run-cyan/70 uppercase tracking-widest mb-2">Average Pace</p>
              <p 
                className="text-6xl font-black mb-2"
                style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
              >
                {formatPace(runData.pace)}
              </p>
              <p className="text-run-cyan/70 font-bold">/km</p>
            </div>
          </div>

          {/* Effort */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 uppercase tracking-widest">Perceived Effort (RPE)</span>
              <span className="text-3xl font-black text-run-cyan">{run.perceived_effort}</span>
            </div>
            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-run-cyan to-blue-500 rounded-full transition-all"
                style={{ width: `${(run.perceived_effort / 10) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Easy</span>
              <span>Maximal</span>
            </div>
          </div>

          {/* Notes */}
          {run.notes && (
            <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Notes</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{run.notes}</p>
            </div>
          )}

          {/* Splits (Future feature placeholder) */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-5 text-center">
            <Activity className="mx-auto mb-3 text-gray-600" size={32} />
            <p className="text-gray-500 text-sm">Split times coming soon!</p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}