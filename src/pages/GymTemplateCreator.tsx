import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { WorkoutSettings } from '../components/gym/WorkoutSettings'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function GymTemplateCreator() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    track_weight: true,
    track_reps: true,
    track_time: false,
    track_distance: false,
    auto_rest_timer: true,
    default_rest_seconds: 90,
  })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleSave() {
    if (!user || !name.trim()) return

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          workout_type_id: 1, // Gym
          name: name.trim(),
          description: description.trim() || null,
          ...settings,
        })
        .select()
        .single()

      if (error) throw error

      navigate(`/gym/template/${data.id}/edit`)
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Error saving workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="New Workout"
      showBack
      headerAction={
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="px-4 py-2 bg-gym-gradient rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Save size={18} />
          Save
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workout Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Push Day"
                className="input-field text-lg"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus on chest and shoulders..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gym-orange/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Tracking Settings</p>
                <p className="text-sm text-gray-400">Customize what to log</p>
              </div>
            </div>
            <ChevronRight 
              size={20} 
              className={`text-gray-400 transition-transform ${showSettings ? 'rotate-90' : ''}`}
            />
          </button>

          {/* Settings Panel */}
          {showSettings && (
            <div className="animate-slide-up">
              <WorkoutSettings settings={settings} onChange={setSettings} />
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              💡 <strong>Tip:</strong> After saving, you'll add exercises and customize tracking for each one!
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}