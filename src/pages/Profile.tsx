import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Flame, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { ActivityCalendar } from '../components/profile/ActivityCalendar.tsx'
import { WorkoutHistoryList } from '../components/profile/WorkoutHistoryList.tsx'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface MonthlyStats {
  gymWorkouts: number
  runSessions: number
  totalVolume: number
  totalDistance: number
  totalWorkouts: number
  currentStreak: number
}

export function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [stats, setStats] = useState<MonthlyStats>({
    gymWorkouts: 0,
    runSessions: 0,
    totalVolume: 0,
    totalDistance: 0,
    totalWorkouts: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlyStats()
  }, [])

  async function fetchMonthlyStats() {
    if (!user) return

    try {
      // Get current month start
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all sessions this month
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          session_exercises(weight, reps)
        `)
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString())
        .order('date', { ascending: false })

      if (error) throw error

      // Calculate stats
      const gymWorkouts = sessions?.filter(s => s.workout_type_id === 1).length || 0
      const runSessions = sessions?.filter(s => s.workout_type_id === 2).length || 0
      
      const totalVolume = sessions?.reduce((sum, s) => {
        if (s.workout_type_id === 1 && s.session_exercises) {
          return sum + s.session_exercises.reduce((exSum: number, ex: any) => {
            return exSum + ((ex.weight || 0) * (ex.reps || 0))
          }, 0)
        }
        return sum
      }, 0) || 0

      // Calculate streak
      const streak = await calculateStreak()

      setStats({
        gymWorkouts,
        runSessions,
        totalVolume,
        totalDistance: 0, // Will add when running is implemented
        totalWorkouts: sessions?.length || 0,
        currentStreak: streak,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <PageLayout 
      title="Profile"
      headerAction={
        <button
          onClick={() => navigate('/settings')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings size={24} />
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        
        {/* User Info Card */}
        <div className="px-4 pt-4 pb-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gym-gradient rounded-full flex items-center justify-center text-3xl font-black shadow-glow-orange">
                {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-1">
                  {user?.user_metadata?.username || 'Warrior'}
                </h2>
                <p className="text-sm text-gray-400">Member since {memberSince}</p>
              </div>
            </div>

            {/* Streak */}
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gym-orange/10 border border-gym-orange/30 rounded-xl">
                <Flame className="text-gym-orange" size={24} />
                <div>
                  <p className="text-2xl font-black text-gym-orange">{stats.currentStreak} days</p>
                  <p className="text-xs text-gray-400">Current streak</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="px-4 pb-6">
          <h3 className="text-lg font-bold mb-3 px-1">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Gym Stats */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xl">💪</div>
                <span className="text-xs text-gray-400">Gym</span>
              </div>
              <p className="text-2xl font-black mb-1">{stats.gymWorkouts}</p>
              <p className="text-xs text-gray-500">workouts</p>
              {stats.totalVolume > 0 && (
                <p className="text-xs text-gym-orange mt-1 font-semibold">
                  {Math.round(stats.totalVolume).toLocaleString()} kg
                </p>
              )}
            </div>

            {/* Running Stats */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xl">🏃</div>
                <span className="text-xs text-gray-400">Running</span>
              </div>
              <p className="text-2xl font-black mb-1">{stats.runSessions}</p>
              <p className="text-xs text-gray-500">runs</p>
              {stats.totalDistance > 0 && (
                <p className="text-xs text-run-cyan mt-1 font-semibold">
                  {stats.totalDistance.toFixed(1)} km
                </p>
              )}
            </div>

            {/* Total */}
            <div className="stat-card col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} className="text-success-green" />
                    <span className="text-xs text-gray-400">Total Activity</span>
                  </div>
                  <p className="text-3xl font-black">{stats.totalWorkouts}</p>
                  <p className="text-xs text-gray-500">sessions</p>
                </div>
                <div className="text-right">
                  <p className="text-success-green text-sm font-semibold">+{stats.totalWorkouts > 0 ? Math.round((stats.totalWorkouts / new Date().getDate()) * 100) : 0}%</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-bold">Activity Calendar</h3>
            <CalendarIcon size={20} className="text-gray-400" />
          </div>
          <ActivityCalendar />
        </div>

        {/* Workout History */}
        <div className="px-4 pb-6">
          <h3 className="text-lg font-bold mb-3 px-1">Recent Workouts</h3>
          <WorkoutHistoryList limit={5} />
        </div>
      </div>
    </PageLayout>
  )
}