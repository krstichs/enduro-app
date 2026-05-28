import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, Activity, Dumbbell, Calendar } from 'lucide-react'

interface ProgressData {
  date: string
  volume: number
  distance: number
  workouts: number
}

export function Progress() {
  const { user } = useAuth()
  
  const [chartData, setChartData] = useState<ProgressData[]>([])
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalDistance: 0,
    totalWorkouts: 0,
    avgVolumePerWorkout: 0,
    bestStreak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    fetchProgressData()
  }, [timeRange, user])

  async function fetchProgressData() {
    if (!user) return

    try {
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        startDate.setDate(now.getDate() - 30)
      } else {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Fetch all sessions in range
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          session_exercises(weight, reps),
          running_sessions(distance)
        `)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())

      // Group by date
      const grouped: { [key: string]: ProgressData } = {}

      sessions?.forEach(session => {
        const dateStr = new Date(session.date).toLocaleDateString('en-US')
        
        if (!grouped[dateStr]) {
          grouped[dateStr] = { date: dateStr, volume: 0, distance: 0, workouts: 0 }
        }

        grouped[dateStr].workouts++

        if (session.workout_type_id === 1 && session.session_exercises) {
          const volume = session.session_exercises.reduce((sum: number, ex: any) => {
            return sum + ((ex.weight || 0) * (ex.reps || 0))
          }, 0)
          grouped[dateStr].volume += volume
        }

        if (session.running_sessions?.[0]) {
          grouped[dateStr].distance += session.running_sessions[0].distance || 0
        }
      })

      const data = Object.values(grouped)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setChartData(data)

      // Calculate stats
      const totalVolume = data.reduce((sum, d) => sum + d.volume, 0)
      const totalDistance = data.reduce((sum, d) => sum + d.distance, 0)
      const totalWorkouts = data.reduce((sum, d) => sum + d.workouts, 0)

      setStats({
        totalVolume,
        totalDistance,
        totalWorkouts,
        avgVolumePerWorkout: totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0,
        bestStreak: 0, // Calculate separately if needed
      })
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#FF6B35', '#00D9FF', '#10B981']

  return (
    <PageLayout title="Progress" showBack>
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        
        {/* Time Range Selector */}
        <div className="px-4 pt-4 pb-6">
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  timeRange === range
                    ? 'bg-gym-orange text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {range === 'week' ? '7d' : range === 'month' ? '30d' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-4 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <Dumbbell className="text-gym-orange mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{Math.round(stats.totalVolume)}</p>
                <p className="text-xs text-gray-500">Total Volume (kg)</p>
              </div>

              <div className="stat-card">
                <Activity className="text-run-cyan mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.totalDistance.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Total Distance (km)</p>
              </div>

              <div className="stat-card">
                <Calendar className="text-success-green mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.totalWorkouts}</p>
                <p className="text-xs text-gray-500">Total Workouts</p>
              </div>

              <div className="stat-card">
                <TrendingUp className="text-accent-purple mb-2" size={24} />
                <p className="text-3xl font-black mb-1">{stats.avgVolumePerWorkout}</p>
                <p className="text-xs text-gray-500">Avg Volume/WO</p>
              </div>
            </div>

            {/* Volume Progress Chart */}
            {chartData.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-4">Volume Progress (kg)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#999' }}
                      interval={Math.floor(chartData.length / 5)}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 10, 10, 0.9)',
                        border: '1px solid rgba(255, 107, 53, 0.3)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="volume" fill="#FF6B35" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Distance Progress Chart */}
            {chartData.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-4">Running Distance (km)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#999' }}
                      interval={Math.floor(chartData.length / 5)}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 10, 10, 0.9)',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="distance" 
                      stroke="#00D9FF" 
                      strokeWidth={3}
                      dot={{ fill: '#00D9FF', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Workouts Distribution */}
            {chartData.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-4">Total Workouts</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#999' }}
                      interval={Math.floor(chartData.length / 5)}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 10, 10, 0.9)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="workouts" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {chartData.length === 0 && (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">No progress data yet. Start working out!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}