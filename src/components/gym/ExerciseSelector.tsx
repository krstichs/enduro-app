import { useState, useEffect } from 'react'
import { Search, X, Plus, Dumbbell } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
}

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void
  selectedIds: number[]
}

export function ExerciseSelector({ onSelect, selectedIds }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const muscleGroups = ['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [searchQuery, selectedMuscle, exercises])

  async function fetchExercises() {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error
      setExercises(data || [])
      setFilteredExercises(data || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterExercises() {
    let filtered = exercises

    // Filter by muscle group
    if (selectedMuscle !== 'all') {
      filtered = filtered.filter(ex => ex.muscle_group === selectedMuscle)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredExercises(filtered)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-enduro-gray rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Add Exercise</h2>
            <button
              onClick={() => onSelect(null as any)}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-12 pr-4 py-3 bg-enduro-dark border border-white/10 rounded-xl text-enduro-light focus:outline-none focus:border-gym-orange/50 transition-colors"
            />
          </div>
        </div>

        {/* Muscle Group Filter */}
        <div className="px-6 py-4 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2">
            {muscleGroups.map((muscle) => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedMuscle === muscle
                    ? 'bg-gym-gradient text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {muscle === 'all' ? 'All' : muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gym-orange/30 border-t-gym-orange rounded-full animate-spin" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400">No exercises found</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const isSelected = selectedIds.includes(exercise.id)
              
              return (
                <button
                  key={exercise.id}
                  onClick={() => !isSelected && onSelect(exercise)}
                  disabled={isSelected}
                  className={`w-full p-4 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-white/5 opacity-50 cursor-not-allowed'
                      : 'glass-card hover:bg-white/10 active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/5' : 'bg-gym-orange/20'
                    }`}>
                      <Dumbbell size={20} className={isSelected ? 'text-gray-500' : 'text-gym-orange'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{exercise.name}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {exercise.muscle_group} • {exercise.equipment}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="text-xs text-success-green font-medium">Added</span>
                    ) : (
                      <Plus size={20} className="text-gym-orange flex-shrink-0" />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}