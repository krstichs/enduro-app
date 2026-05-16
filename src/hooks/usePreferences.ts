import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UserPreferences {
  gym_enabled: boolean
  running_enabled: boolean
  units_weight: 'kg' | 'lbs'
  units_distance: 'km' | 'miles'
  theme: string
}

export function usePreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPreferences()
    }
  }, [user])

  async function fetchPreferences() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setPreferences(data)
    } catch (error) {
      console.error('Error:', error)
      // Set defaults if not found
      setPreferences({
        gym_enabled: true,
        running_enabled: true,
        units_weight: 'kg',
        units_distance: 'km',
        theme: 'dark',
      })
    } finally {
      setLoading(false)
    }
  }

  return { preferences, loading, refetch: fetchPreferences }
}