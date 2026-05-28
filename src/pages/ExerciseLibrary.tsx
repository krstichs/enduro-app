import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Play, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { supabase } from '../lib/supabase'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
  description: string | null
  image_url: string | null
  video_url: string | null
  tips: string | null
}

export function ExerciseLibrary() {
  const navigate = useNavigate()
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Legs',
    'Glutes',
    'Core',
  ]

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [search, selectedMuscle, exercises])

  async function fetchExercises() {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error
      setExercises(data || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterExercises() {
    let filtered = exercises

    if (search) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedMuscle && selectedMuscle !== 'All') {
      filtered = filtered.filter(ex => ex.muscle_group === selectedMuscle)
    }

    setFilteredExercises(filtered)
  }

  return (
    <PageLayout 
      title="Exercise Library"
      showBack
      headerAction={
        <button
          onClick={() => navigate('/exercises/add')}
          className="w-10 h-10 bg-gym-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gym-orange/30 active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      }
    >
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker pb-24">
        
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-4 sticky top-0 z-10 bg-enduro-darker">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Muscle Group Filter */}
        <div className="px-4 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group === 'All' ? null : group)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold text-sm transition-all ${
                  (group === 'All' && selectedMuscle === null) ||
                  selectedMuscle === group
                    ? 'bg-gym-orange text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="px-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No exercises found</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="w-full glass-card rounded-2xl p-4 hover:bg-white/10 transition-all active:scale-98 text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Image Thumbnail */}
                  {exercise.image_url ? (
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gym-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={24} className="text-gym-orange" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                    <p className="text-sm text-gray-400">{exercise.muscle_group} • {exercise.equipment}</p>
                    {exercise.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{exercise.description}</p>
                    )}
                  </div>

                  {/* Indicators */}
                  <div className="flex items-center gap-2">
                    {exercise.video_url && (
                      <div className="w-8 h-8 bg-run-cyan/20 rounded-lg flex items-center justify-center">
                        <Play size={16} className="text-run-cyan fill-run-cyan" />
                      </div>
                    )}
                    <ChevronRight className="text-gray-600 group-hover:text-gym-orange transition-colors" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end animate-in">
          <div className="w-full bg-enduro-dark rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Image */}
            {selectedExercise.image_url ? (
              <img
                src={selectedExercise.image_url}
                alt={selectedExercise.name}
                className="w-full h-80 object-cover rounded-2xl mb-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-80 bg-gym-orange/20 rounded-2xl mb-6 flex items-center justify-center">
                <ImageIcon size={64} className="text-gym-orange/50" />
              </div>
            )}

            {/* Title & Info */}
            <h2 className="text-3xl font-black mb-2">{selectedExercise.name}</h2>
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-gym-orange/20 text-gym-orange rounded-full text-sm font-semibold">
                {selectedExercise.muscle_group}
              </span>
              <span className="px-3 py-1 bg-run-cyan/20 text-run-cyan rounded-full text-sm font-semibold">
                {selectedExercise.equipment}
              </span>
            </div>

            {/* Description */}
            {selectedExercise.description && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">How to Perform</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedExercise.description}</p>
              </div>
            )}

            {/* Tips */}
            {selectedExercise.tips && (
              <div className="mb-6 glass-card rounded-2xl p-4">
                <h3 className="font-bold text-lg mb-2">💡 Pro Tips</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedExercise.tips}</p>
              </div>
            )}

            {/* Video Link */}
            {selectedExercise.video_url && (
              <a
                href={selectedExercise.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary-gym flex items-center justify-center gap-2 mb-4 hover:scale-105 transition-transform"
              >
                <Play size={20} fill="currentColor" />
                Watch Video Tutorial
              </a>
            )}

            {/* Use in Workout Button */}
            <button
              onClick={() => {
                setSelectedExercise(null)
              }}
              className="w-full py-3 bg-success-green text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              Use in Workout
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  )
}