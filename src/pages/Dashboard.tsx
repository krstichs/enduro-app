import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/Logo'

export function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-enduro-dark text-enduro-light">
      <nav className="bg-enduro-gray border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo variant="light" className="h-8" />
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              👤 {user?.user_metadata?.username || user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard 💪</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-enduro-gray p-8 rounded-xl border border-gym-orange">
            <div className="text-5xl mb-4">🏋️</div>
            <h2 className="text-2xl font-bold mb-2">Gym Workouts</h2>
            <p className="text-gray-400 mb-4">Kreiraj i prati svoje gym treninge</p>
            <button className="bg-gym-orange hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              Počni trening
            </button>
          </div>

          <div className="bg-enduro-gray p-8 rounded-xl border border-run-cyan">
            <div className="text-5xl mb-4">🏃</div>
            <h2 className="text-2xl font-bold mb-2">Running</h2>
            <p className="text-gray-400 mb-4">Planiraj i loguj trčanje</p>
            <button className="bg-run-cyan hover:bg-teal-500 text-enduro-dark px-6 py-3 rounded-lg font-semibold transition-colors">
              Start run
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-success-green/10 border border-success-green rounded-xl">
          <p className="text-success-green font-semibold">
            ✅ Uspešno si ulogovan! Dashboard je spreman, sad gradimo dalje features!
          </p>
        </div>
      </div>
    </div>
  )
}