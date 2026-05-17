import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Clock } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const workoutTypes = [
  { value: 'easy', label: 'Easy Run', emoji: '😌', description: 'Comfortable pace, build endurance' },
  { value: 'tempo', label: 'Tempo Run', emoji: '⚡', description: 'Comfortably hard, sustained effort' },
  { value: 'interval', label: 'Interval Training', emoji: '🔥', description: 'Fast bursts with recovery' },
  { value: 'long_run', label: 'Long Run', emoji: '🎯', description: 'Extended distance, slower pace' },
  { value: 'recovery', label: 'Recovery Run', emoji: '💆', description: 'Very easy, active recovery' },
]

export function RunningTemplateCreator() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workoutType, setWorkoutType] = useState('easy')
  const [targetDistance, setTargetDistance] = useState<number>(5)
  const [targetDuration, setTargetDuration] = useState<number>(30)
  const [includeTime, setIncludeTime] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!user || !name.trim()) {
      alert('Please enter a name for your run')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('running_templates')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          workout_type: workoutType,
          target_distance: targetDistance,
          target_duration: includeTime ? targetDuration * 60 : null,
          notes: notes.trim() || null,
        })
      if (error) throw error
      navigate('/running')
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Error saving running plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="New Plan"
      showBack
      headerAction={
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="px-5 py-2 bg-gradient-to-r from-run-cyan to-blue-500 text-[#070b11] rounded-full font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 transition-all"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      }
    >
      <div className="min-h-screen bg-[#070b11] pb-24 pt-4 px-4 text-white font-sans">
        <div className="max-w-md mx-auto space-y-5">
          
          {/* Basic Info Card */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 space-y-5 shadow-2xl">
            <div>
              <label className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3 block ml-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning 5K"
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white font-bold text-lg focus:outline-none focus:border-run-cyan/50 placeholder:text-gray-700 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3 block ml-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Easy pace around the park..."
                rows={2}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-run-cyan/50 resize-none placeholder:text-gray-700 transition-colors"
              />
            </div>
          </div>

          {/* Workout Type */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Run Type</h2>
            <div className="space-y-3">
              {workoutTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setWorkoutType(type.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                    workoutType === type.value
                      ? 'bg-run-cyan/[0.08] border border-run-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.1)] scale-[1.02]'
                      : 'bg-black/30 border border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl bg-white/5 p-2 rounded-xl">{type.emoji}</div>
                    <div className="flex-1">
                      <p className={`font-bold ${workoutType === type.value ? 'text-run-cyan' : 'text-white'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Distance (Reused styling from QuickLog) */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Target Distance</h2>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <input
                type="number"
                value={targetDistance || ''}
                onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                className="bg-transparent text-6xl font-black text-white w-32 text-center focus:outline-none placeholder:text-gray-700"
                placeholder="5.0"
              />
              <span className="text-2xl text-run-cyan font-bold">km</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[3, 5, 10, 15, 21.1].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setTargetDistance(dist)}
                  className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                    targetDistance === dist
                      ? 'bg-run-cyan text-[#070b11] shadow-[0_0_10px_rgba(0,255,255,0.4)] scale-105'
                      : 'bg-black/30 text-gray-400 border border-white/5'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Target Time */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <Clock size={16} className={includeTime ? 'text-run-cyan' : ''} />
                Target Time
              </label>
              
              {/* Custom Neon Toggle Switch */}
              <button
                onClick={() => setIncludeTime(!includeTime)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 outline-none ${
                  includeTime ? 'bg-run-cyan shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-black/50 border border-white/10'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                  includeTime ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {includeTime && (
              <div className="mt-6 flex items-baseline justify-center gap-2 animate-in fade-in slide-in-from-top-4">
                <input
                  type="number"
                  value={targetDuration || ''}
                  onChange={(e) => setTargetDuration(parseInt(e.target.value) || 0)}
                  min="1"
                  className="bg-transparent text-6xl font-black text-white w-32 text-center focus:outline-none placeholder:text-gray-700 border-b border-run-cyan/30"
                  placeholder="30"
                />
                <span className="text-2xl text-gray-500 font-bold">min</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="glass-card bg-white/[0.03] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 text-center">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keep heart rate low, focus on form..."
              rows={3}
              className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-run-cyan/30 resize-none placeholder:text-gray-600"
            />
          </div>

        </div>
      </div>
    </PageLayout>
  )
}