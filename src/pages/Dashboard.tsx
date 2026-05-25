import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PageLayout } from '../components/layout/PageLayout'
import { Dumbbell, Activity, Flame, TrendingUp, Clock, Settings as SettingsIcon, Plus, Calendar, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SkeletonCard, SkeletonStats } from '../components/ui/Skeleton'

interface DashboardStats {
  streak: number
  gymTemplatesCount: number
  weeklyDistance: number
  weeklyTrainingTime: number
  weeklyWorkouts: number
  recentSessions: any[]
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    gymTemplatesCount: 0,
    weeklyDistance: 0,
    weeklyTrainingTime: 0,
    weeklyWorkouts: 0,
    recentSessions: [],
  })
  const [loading, setLoading] = useState(true)
  
  const username = user?.user_metadata?.username || 'Warrior'

  useEffect(() => {
    fetchDashboardStats()
  }, [user])

  async function fetchDashboardStats() {
    if (!user) return

    try {
      // Get start of this week (Monday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday as start
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() + diff)
      weekStart.setHours(0, 0, 0, 0)

      // 1. Fetch gym templates count
      const { data: templates } = await supabase
        .from('workout_templates')
        .select('id')
        .eq('user_id', user.id)
        .eq('workout_type_id', 1)

      // 2. Fetch this week's sessions
      const { data: weeklySessions } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          running_sessions(distance)
        `)
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString())

      // 3. Calculate weekly stats
      const weeklyDistance = weeklySessions?.reduce((sum, s) => {
        if (s.running_sessions && s.running_sessions.length > 0) {
          return sum + (s.running_sessions[0].distance || 0)
        }
        return sum
      }, 0) || 0

      const weeklyTrainingTime = weeklySessions?.reduce((sum, s) => {
        return sum + (s.duration || 0)
      }, 0) || 0

      // 4. Calculate streak
      const streak = await calculateStreak()

      // 5. Fetch recent 3 sessions
      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_template:workout_templates(name),
          session_exercises(exercise_id),
          running_sessions(distance)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(3)

      setStats({
        streak,
        gymTemplatesCount: templates?.length || 0,
        weeklyDistance,
        weeklyTrainingTime: Math.round(weeklyTrainingTime / 3600), // Convert to hours
        weeklyWorkouts: weeklySessions?.length || 0,
        recentSessions: recentSessions || [],
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function calculateStreak() {
    if (!user) return 0

    try {
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!sessions || sessions.length === 0) return 0

      // Get unique dates
      const dates = [...new Set(sessions.map(s => 
        new Date(s.date).toDateString()
      ))]

      let streak = 0
      const today = new Date().toDateString()
      let checkDate = new Date()

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toDateString()
        if (dates.includes(dateStr)) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (dateStr !== today) {
          break
        } else {
          checkDate.setDate(checkDate.getDate() - 1)
        }
      }

      return streak
    } catch (error) {
      console.error('Error calculating streak:', error)
      return 0
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
      const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      return `${daysAgo} days ago`
    }
  }

  return (
    <PageLayout 
      showBottomNav
      headerAction={
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <SettingsIcon size={24} />
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker">
        {/* Hero Section */}
        <div className="relative px-4 pt-6 pb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gym-orange/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-black">
              Hey, <span className="bg-gym-gradient bg-clip-text">{username}</span>! 👋
            </h1>
            <p className="text-gray-400 text-lg">Time to get to work</p>
          </div>
        </div>

        {/* Streak Card */}
        {stats.streak > 0 && (
          <div className="px-4 mb-6 animate-slide-up">
            <div className="glass-card rounded-3xl p-6 border-2 border-gym-orange/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gym-orange/30 rounded-full blur-xl" />
                    <div className="relative w-16 h-16 bg-gym-gradient rounded-full flex items-center justify-center">
                      <Flame size={32} />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{stats.streak}</p>
                    <p className="text-gray-400 text-sm">Day Streak</p>
                  </div>
                </div>
                {stats.streak >= 7 && (
                  <div className="text-right">
                    <p className="text-success-green font-semibold flex items-center gap-1">
                      <TrendingUp size={16} />
                      {stats.streak >= 30 ? 'Beast Mode! 🔥' : 'Keep it up!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Workout Type Cards */}
        <div className="px-4 mb-8 space-y-4 animate-scale-in">
          {/* Gym Card */}
          <button
            onClick={() => navigate('/gym')}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gym-gradient opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
              
              <div className="relative gradient-card-gym rounded-3xl p-6 group-active:scale-98 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gym-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-gym-orange/30">
                      <Dumbbell size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold mb-1">Gym Workout</h3>
                      <p className="text-gray-400">Start a power session</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gym-orange">{stats.gymTemplatesCount}</p>
                    <p className="text-xs text-gray-500">templates</p>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Running Card */}
          <button
            onClick={() => navigate('/running')}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-run-gradient opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
              
              <div className="relative gradient-card-run rounded-3xl p-6 group-active:scale-98 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-run-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-run-cyan/30">
                      <Activity size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold mb-1">Running</h3>
                      <p className="text-gray-400">Run towards your goal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-run-cyan">
                      {stats.weeklyDistance > 0 ? stats.weeklyDistance.toFixed(1) : '0'}
                    </p>
                    <p className="text-xs text-gray-500">km this week</p>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold mb-4">This Week</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <div className="text-gym-orange mb-2">
                <Clock size={24} />
              </div>
              <p className="text-3xl font-black mb-1">
                {stats.weeklyTrainingTime > 0 ? `${stats.weeklyTrainingTime.toFixed(1)}h` : '0h'}
              </p>
              <p className="text-gray-500 text-sm">Training</p>
            </div>

            <div className="stat-card">
              <div className="text-run-cyan mb-2">
                <TrendingUp size={24} />
              </div>
              <p className="text-3xl font-black mb-1">{stats.weeklyWorkouts}</p>
              <p className="text-gray-500 text-sm">Workouts</p>
            </div>
          </div>
        </div>


        {/* Quick Start */}
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Quick Start</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/gym/new')}
              className="glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98"
            >
              <div className="w-12 h-12 bg-gym-orange/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Plus size={24} className="text-gym-orange" />
              </div>
              <p className="font-semibold text-sm">New Workout</p>
              <p className="text-xs text-gray-500 mt-1">Create template</p>
            </button>

            <button
              onClick={() => navigate('/running/log')}
              className="glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98"
            >
              <div className="w-12 h-12 bg-run-cyan/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Activity size={24} className="text-run-cyan" />
              </div>
              <p className="font-semibold text-sm">Log Run</p>
              <p className="text-xs text-gray-500 mt-1">Quick entry</p>
            </button>

            {stats.gymTemplatesCount > 0 && (
              <button
                onClick={() => navigate('/gym')}
                className="glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98"
              >
                <div className="w-12 h-12 bg-success-green/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Play size={24} className="text-success-green" fill="currentColor" />
                </div>
                <p className="font-semibold text-sm">Start Template</p>
                <p className="text-xs text-gray-500 mt-1">{stats.gymTemplatesCount} saved</p>
              </button>
            )}

            <button
              onClick={() => navigate('/profile')}
              className="glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98"
            >
              <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Calendar size={24} className="text-accent-purple" />
              </div>
              <p className="font-semibold text-sm">View Progress</p>
              <p className="text-xs text-gray-500 mt-1">See calendar</p>
            </button>
          </div>
        </div>
{/* Recent Activity */}
        <div className="px-4 pb-24">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          
          {loading ? (
            <div className="space-y-6">
              {/* Ako treba da se prikaže i SkeletonStats ovde, stavi ga. Ako ne, obriši ga. */}
              {/* <SkeletonStats /> */}
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ) : stats.recentSessions.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <div className="text-5xl mb-3">💪</div>
              <p className="text-gray-400 mb-4">No workouts yet</p>
              <p className="text-sm text-gray-500">Start your first session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/workout/${session.id}`)}
                  className="w-full glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      session.workout_type_id === 1 ? 'bg-gym-orange/20' : 'bg-run-cyan/20'
                    }`}>
                      {session.workout_type_id === 1 ? (
                        <Dumbbell size={20} className="text-gym-orange" />
                      ) : (
                        <Activity size={20} className="text-run-cyan" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {session.workout_template?.name || 
                          (session.workout_type_id === 1 ? 'Gym Workout' : 'Running')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(session.date)} • {Math.round(session.duration / 60)} min
                      </p>
                    </div>
                    <div className="text-right">
                      {session.workout_type_id === 1 ? (
                        <p className="text-sm font-semibold text-gym-orange">
                          {session.session_exercises?.length || 0} exercises
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-run-cyan">
                          {session.running_sessions?.[0]?.distance?.toFixed(1) || 0} km
                        </p>
                      )}
                    </div>
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