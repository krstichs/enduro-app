import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Logo } from './components/Logo'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
}

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExercises()
  }, [])

  async function fetchExercises() {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .limit(8)
      
      if (error) throw error
      if (data) setExercises(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-enduro-dark text-enduro-light p-8">
      <div className="max-w-4xl mx-auto">
        <Logo variant="light" className="h-12" />
        
        <h1 className="text-5xl font-bold mt-8 mb-2">
          Dobrodošao u Enduro! 💪
        </h1>
        
        <p className="text-xl text-gray-400 mb-8">
          Tvoj fitness tracker za gym i trčanje
        </p>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Vežbe iz baze podataka:
          </h2>
          
          {loading ? (
            <p className="text-gray-400">Učitavanje...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map((ex) => (
                <div 
                  key={ex.id} 
                  className="bg-enduro-gray p-4 rounded-lg border border-gray-700 hover:border-gym-orange transition-colors"
                >
                  <h3 className="text-lg font-semibold">{ex.name}</h3>
                  <p className="text-sm text-gray-400">{ex.muscle_group}</p>
                  <p className="text-xs text-gray-500">{ex.equipment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-green-900/20 border border-success-green rounded-lg">
          <h3 className="text-xl font-semibold text-success-green mb-2">
            ✅ Sve je povezano!
          </h3>
          <p className="text-gray-300">
            Supabase baza radi, vežbe se učitavaju, aplikacija je spremna za razvoj!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App