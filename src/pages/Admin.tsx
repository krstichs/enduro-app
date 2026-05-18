import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Download, TrendingUp, Activity, Database } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UserData {
  id: string
  email: string
  username: string | null
  created_at: string
  last_sign_in: string | null
  workouts_count: number
}

interface AdminStats {
  totalUsers: number
  activeThisWeek: number
  totalWorkouts: number
  totalGymSessions: number
  totalRunSessions: number
}

export function Admin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeThisWeek: 0,
    totalWorkouts: 0,
    totalGymSessions: 0,
    totalRunSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    if (!user) return

    try {
      // Fetch all user preferences (this gives us all users)
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('user_id, created_at')

      if (prefsError) throw prefsError

      // Fetch user metadata for each user
      const userPromises = prefs?.map(async (pref) => {
        // Get auth user data
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(pref.user_id)
        
        // Get workout count
        const { count: workoutCount } = await supabase
          .from('workout_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', pref.user_id)

        return {
          id: pref.user_id,
          email: authUser?.email || 'Unknown',
          username: authUser?.user_metadata?.username || null,
          created_at: pref.created_at,
          last_sign_in: authUser?.last_sign_in_at || null,
          workouts_count: workoutCount || 0,
        }
      }) || []

      const usersData = await Promise.all(userPromises)
      setUsers(usersData)

      // Calculate stats
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: allSessions } = await supabase
        .from('workout_sessions')
        .select('workout_type_id, date, user_id')

      const activeThisWeek = new Set(
        allSessions?.filter(s => new Date(s.date) >= weekAgo).map(s => s.user_id)
      ).size

      const gymSessions = allSessions?.filter(s => s.workout_type_id === 1).length || 0
      const runSessions = allSessions?.filter(s => s.workout_type_id === 2).length || 0

      setStats({
        totalUsers: usersData.length,
        activeThisWeek,
        totalWorkouts: allSessions?.length || 0,
        totalGymSessions: gymSessions,
        totalRunSessions: runSessions,
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    const headers = ['Email', 'Username', 'Created At', 'Last Sign In', 'Workouts']
    const rows = users.map(u => [
      u.email,
      u.username || 'N/A',
      new Date(u.created_at).toLocaleDateString(),
      u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : 'Never',
      u.workouts_count.toString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enduro-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <PageLayout 
      title="Admin Panel"
      showBack
      headerAction={
        <button
          onClick={exportToCSV}
          disabled={users.length === 0}
          className="px-4 py-2 bg-gym-gradient rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Download size={18} />
          Export CSV
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 space-y-6">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <Users className="text-gym-orange mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>

              <div className="stat-card">
                <Activity className="text-success-green mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.activeThisWeek}</p>
                <p className="text-xs text-gray-500">Active This Week</p>
              </div>

              <div className="stat-card">
                <Database className="text-run-cyan mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.totalWorkouts}</p>
                <p className="text-xs text-gray-500">Total Workouts</p>
              </div>

              <div className="stat-card">
                <TrendingUp className="text-accent-purple mb-2" size={24} />
                <p className="text-3xl font-black mb-1">
                  {stats.totalUsers > 0 ? (stats.totalWorkouts / stats.totalUsers).toFixed(1) : 0}
                </p>
                <p className="text-xs text-gray-500">Avg per User</p>
              </div>
            </div>

            {/* Workout Type Breakdown */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Workout Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">💪 Gym Sessions</span>
                    <span className="font-semibold">{stats.totalGymSessions}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gym-gradient rounded-full"
                      style={{ 
                        width: `${stats.totalWorkouts > 0 ? (stats.totalGymSessions / stats.totalWorkouts) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">🏃 Running Sessions</span>
                    <span className="font-semibold">{stats.totalRunSessions}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-run-gradient rounded-full"
                      style={{ 
                        width: `${stats.totalWorkouts > 0 ? (stats.totalRunSessions / stats.totalWorkouts) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold px-1">All Users ({users.length})</h3>

              {users.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Users size={48} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                users.map((userData) => (
                  <div key={userData.id} className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gym-gradient rounded-full flex items-center justify-center text-xl font-black flex-shrink-0">
                        {userData.username?.[0]?.toUpperCase() || userData.email[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {userData.username || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">{userData.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>
                            Joined {new Date(userData.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                          {userData.workouts_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-gym-orange font-semibold">
                                {userData.workouts_count} workouts
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}