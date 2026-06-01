import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, LogOut, Dumbbell, Activity, Scale, Map, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface UserPreferences {
  gym_enabled: boolean
  running_enabled: boolean
  units_weight: 'kg' | 'lbs'
  units_distance: 'km' | 'miles'
  theme: string
}

export function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { showToast } = useToast()

  const [preferences, setPreferences] = useState<UserPreferences>({
    gym_enabled: true,
    running_enabled: true,
    units_weight: 'kg',
    units_distance: 'km',
    theme: 'dark',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          await createDefaultPreferences()
        } else {
          throw error
        }
      } else {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      showToast('Error loading preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function createDefaultPreferences() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          gym_enabled: true,
          running_enabled: true,
          units_weight: 'kg',
          units_distance: 'km',
          theme: 'dark',
        })
        .select()
        .single()

      if (error) throw error
      setPreferences(data)
    } catch (error) {
      console.error('Error creating preferences:', error)
      showToast('Error creating preferences', 'error')
    }
  }

  async function handleSave() {
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      showToast('Settings saved! ✅', 'success')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      showToast('Error saving settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut()
        navigate('/login')
        showToast('Logged out successfully', 'success')
      } catch (error) {
        showToast('Error logging out', 'error')
      }
    }
  }

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <PageLayout title="Settings" showBack>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title="Settings" 
      showBack
      headerAction={
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-gym-gradient rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        <div className="p-4 space-y-6">
          
          {/* User Info */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Account</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Tracking */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Activity Tracking</h3>
            <div className="space-y-4">
              {/* Gym Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gym-orange/20 rounded-lg flex items-center justify-center">
                    <Dumbbell size={20} className="text-gym-orange" />
                  </div>
                  <div>
                    <p className="font-semibold">Gym Workouts</p>
                    <p className="text-sm text-gray-400">Track strength training</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.gym_enabled}
                  onChange={(e) => updatePreference('gym_enabled', e.target.checked)}
                  className="w-12 h-6 appearance-none bg-neutral-800 checked:bg-gym-orange rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none
                  after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:w-4 after:h-4 after:bg-gray-500 checked:after:bg-white after:rounded-full after:transition-transform after:duration-200 checked:after:translate-x-6"
                />
              </label>

              {/* Running Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-run-cyan/20 rounded-lg flex items-center justify-center">
                    <Activity size={20} className="text-run-cyan" />
                  </div>
                  <div>
                    <p className="font-semibold">Running</p>
                    <p className="text-sm text-gray-400">Track cardio & runs</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.running_enabled}
                  onChange={(e) => updatePreference('running_enabled', e.target.checked)}
                  className="w-12 h-6 appearance-none bg-neutral-800 checked:bg-run-cyan rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none
                  after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:w-4 after:h-4 after:bg-gray-500 checked:after:bg-white after:rounded-full after:transition-transform after:duration-200 checked:after:translate-x-6"
                />
              </label>

              {!preferences.gym_enabled && !preferences.running_enabled && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                  ⚠️ At least one activity type must be enabled
                </div>
              )}
            </div>
          </div>

          {/* Units */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Units</h3>
            <div className="space-y-5">
              
              {/* Weight Units */}
              <div>
                <label className="flex items-center gap-3 mb-2.5">
                  <Scale size={20} className="text-gray-400" />
                  <span className="font-semibold text-sm text-gray-300">Weight</span>
                </label>
                <div className="flex bg-neutral-900/90 p-1 rounded-xl gap-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => updatePreference('units_weight', 'kg')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                      preferences.units_weight === 'kg'
                        ? 'border-gym-orange text-gym-orange bg-transparent shadow-sm'
                        : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('units_weight', 'lbs')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                      preferences.units_weight === 'lbs'
                        ? 'border-gym-orange text-gym-orange bg-transparent shadow-sm'
                        : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Pounds (lbs)
                  </button>
                </div>
              </div>

              {/* Distance Units */}
              <div>
                <label className="flex items-center gap-3 mb-2.5">
                  <Map size={20} className="text-gray-400" />
                  <span className="font-semibold text-sm text-gray-300">Distance</span>
                </label>
                <div className="flex bg-neutral-900/90 p-1 rounded-xl gap-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => updatePreference('units_distance', 'km')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                      preferences.units_distance === 'km'
                        ? 'border-run-cyan text-run-cyan bg-transparent shadow-sm'
                        : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Kilometers (km)
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('units_distance', 'miles')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 border ${
                      preferences.units_distance === 'miles'
                        ? 'border-run-cyan text-run-cyan bg-transparent shadow-sm'
                        : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Miles (mi)
                  </button>
                </div>
              </div>

            </div>
          </div>
          
          {/* Admin Panel Link */}
          <button
            onClick={() => navigate('/admin')}
            className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">👑</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Admin Panel</p>
                <p className="text-sm text-gray-400">View users & stats</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          {/* About Section */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <h3 className="text-lg font-bold mb-4">About Enduro</h3>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-3">
                  Built with muscles to help you track your fitness journey
                </p>
                <div className="h-16 bg-gym-gradient rounded-xl flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-white">ENDURO</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Version 1.0 • Open Source
                </p>
                <a
                  href="https://github.com/krstichs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mb-4"
                >
                  <span>GitHub</span>
                  <span>→</span>
                </a>
                <p className="text-xs text-gray-500">
                  Made with heart by <span className="font-bold text-gym-orange">krstichs</span>
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <LogOut size={20} />
            Logout
          </button>
          
        </div>
      </div>
    </PageLayout>
  )
}