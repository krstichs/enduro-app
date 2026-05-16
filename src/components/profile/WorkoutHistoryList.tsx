import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Activity, Star, Calendar, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface WorkoutSession {
  id: number
  date: string
  duration: number
  rating: number
  workout_type_id: number
  workout_template: { name: string } | null
  session_exercises: any[]
}

interface WorkoutHistoryListProps {
  limit?: number
}

export function WorkoutHistoryList({ limit = 10 }: WorkoutHistoryListProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'gym' | 'running'>('all')

  useEffect(() => {
    fetchSessions()
  }, [filter])

  async function fetchSessions() {
    if (!user) return

    try {
      let query = supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_template:workout_templates(name),
          session_exercises(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit)

      if (filter === 'gym') {
        query = query.eq('workout_type_id', 1)
      } else if (filter === 'running') {
        query = query.eq('workout_type_id', 2)
      }

      const { data, error } = await query

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('gym')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'gym'
              ? 'bg-gym-orange/20 text-gym-orange border border-gym-orange/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          💪 Gym
        </button>
        <button
          onClick={() => setFilter('running')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'running'
              ? 'bg-run-cyan/20 text-run-cyan border border-run-cyan/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          🏃 Run
        </button>
      </div>

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">
            {filter === 'gym' ? '🏋️' : filter === 'running' ? '🏃' : '💪'}
          </div>
          <p className="text-gray-400">No workouts yet</p>
        </div>
      ) : (
        sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => navigate(`/workout/${session.id}`)}
            className="w-full glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98 text-left"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                session.workout_type_id === 1
                  ? 'bg-gym-orange/20'
                  : 'bg-run-cyan/20'
              }`}>
                {session.workout_type_id === 1 ? (
                  <Dumbbell size={24} className="text-gym-orange" />
                ) : (
                  <Activity size={24} className="text-run-cyan" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">
                      {session.workout_template?.name || 
                        (session.workout_type_id === 1 ? 'Gym Workout' : 'Run')}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(session.date)}
                      </span>
                      <span>{formatTime(session.date)}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 ml-2">
                    {Array.from({ length: session.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-gym-orange text-gym-orange" />
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  {session.workout_type_id === 1 && (
                    <>
                      <span className="text-gray-400">
                        {session.session_exercises?.length || 0} sets
                      </span>
                      <span className="text-gray-600">•</span>
                    </>
                  )}
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={14} />
                    {Math.round(session.duration / 60)} min
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  )
}