import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Plus } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function GymTemplateCreator() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
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
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to add exercises
      navigate(`/gym/template/${data.id}/edit`)
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Greška pri čuvanju treninga')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout 
      title="Novi Trening"
      showBack
      headerAction={
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="px-4 py-2 bg-gym-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Save size={18} />
          Sačuvaj
        </button>
      }
    >
      <div className="p-4 space-y-6">
        <div className="bg-enduro-gray rounded-xl p-6 border border-gray-700 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Naziv treninga *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. Upper Body A"
              className="w-full px-4 py-3 bg-enduro-dark border border-gray-600 rounded-lg text-enduro-light focus:outline-none focus:border-gym-orange transition-colors text-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opis (opciono)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fokus na grudi i ramena..."
              rows={3}
              className="w-full px-4 py-3 bg-enduro-dark border border-gray-600 rounded-lg text-enduro-light focus:outline-none focus:border-gym-orange transition-colors resize-none"
            />
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm">
            💡 <strong>Tip:</strong> Nakon čuvanja dodaj vežbe iz baze podataka!
          </p>
        </div>
      </div>
    </PageLayout>
  )
}