import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface DayActivity {
  date: string
  hasGym: boolean
  hasRunning: boolean
  count: number
}

export function ActivityCalendar() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activities, setActivities] = useState<Map<string, DayActivity>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthActivities()
  }, [currentMonth])

  async function fetchMonthActivities() {
    if (!user) return

    setLoading(true)

    try {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('date, workout_type_id')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString())
        .lte('date', monthEnd.toISOString())

      if (error) throw error

      // Group by date
      const activityMap = new Map<string, DayActivity>()
      
      sessions?.forEach(session => {
        const dateStr = new Date(session.date).toDateString()
        const existing = activityMap.get(dateStr) || {
          date: dateStr,
          hasGym: false,
          hasRunning: false,
          count: 0,
        }

        if (session.workout_type_id === 1) existing.hasGym = true
        if (session.workout_type_id === 2) existing.hasRunning = true
        existing.count++

        activityMap.set(dateStr, existing)
      })

      setActivities(activityMap)
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDaysInMonth() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    if (next <= new Date()) {
      setCurrentMonth(next)
    }
  }

  function getDayColor(date: Date | null) {
    if (!date) return 'transparent'

    const dateStr = date.toDateString()
    const activity = activities.get(dateStr)

    if (!activity) return 'bg-white/5'
    
    if (activity.hasGym && activity.hasRunning) {
      return 'bg-gradient-to-br from-gym-orange to-run-cyan' // Both!
    } else if (activity.hasGym) {
      return 'bg-gym-orange'
    } else if (activity.hasRunning) {
      return 'bg-run-cyan'
    }

    return 'bg-white/5'
  }

  const days = getDaysInMonth()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) <= new Date()

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <h4 className="font-bold">{monthName}</h4>

        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-gray-500 font-semibold">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isToday = date?.toDateString() === new Date().toDateString()
          const activity = date ? activities.get(date.toDateString()) : null

          return (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                date ? getDayColor(date) : ''
              } ${
                isToday ? 'ring-2 ring-white' : ''
              } ${
                activity ? 'shadow-lg' : ''
              }`}
            >
              {date && (
                <span className={activity ? 'text-white' : 'text-gray-400'}>
                  {date.getDate()}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gym-orange rounded"></div>
          <span className="text-xs text-gray-400">Gym</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-run-cyan rounded"></div>
          <span className="text-xs text-gray-400">Run</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-gym-orange to-run-cyan rounded"></div>
          <span className="text-xs text-gray-400">Both</span>
        </div>
      </div>
    </div>
  )
}