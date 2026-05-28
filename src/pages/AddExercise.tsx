import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Upload } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Legs', 'Glutes', 'Core']
const equipment = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell']

export function AddExercise() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('Chest')
  const [equip, setEquip] = useState('Barbell')
  const [description, setDescription] = useState('')
  const [tips, setTips] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) {
      showToast('Exercise name is required', 'warning')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('exercises')
        .insert({
          name: name.trim(),
          muscle_group: muscleGroup,
          equipment: equip,
          description: description.trim() || null,
          tips: tips.trim() || null,
          image_url: imageUrl.trim() || null,
          video_url: videoUrl.trim() || null,
        })

      if (error) throw error

      showToast('Exercise added successfully! 💪', 'success')
      
      setTimeout(() => {
        navigate('/exercises')
      }, 1000)
    } catch (error) {
      console.error('Error adding exercise:', error)
      showToast('Error adding exercise', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="Add Exercise"
      showBack
      headerAction={
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="px-4 py-2 bg-gym-gradient rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} />
          Save
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        <div className="p-4 space-y-6">
          
          {/* Basic Info */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Exercise Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bench Press"
                className="input-field"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2">Muscle Group</label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="input-field"
                >
                  {muscleGroups.map(mg => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Equipment</label>
                <select
                  value={equip}
                  onChange={(e) => setEquip(e.target.value)}
                  className="input-field"
                >
                  {equipment.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-2">How to Perform</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Step-by-step instructions on how to perform this exercise..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Tips */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-2">Pro Tips & Safety Notes</label>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="Common mistakes, safety tips, form cues..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/exercise.jpg"
              className="input-field mb-3"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
                onError={() => setImageUrl('')}
              />
            )}
          </div>

          {/* Video URL */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-2">Video URL (YouTube/Vimeo)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="input-field"
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              💡 Tip: Use high-quality images showing proper form and detailed descriptions to help users perform exercises correctly.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}