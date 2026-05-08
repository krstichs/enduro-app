import { useAuth } from '../contexts/AuthContext'
import { PageLayout } from '../components/layout/PageLayout'
import { Dumbbell, Activity, TrendingUp, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <PageLayout showBottomNav>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="pt-2">
          <h1 className="text-3xl font-bold mb-1">
            Ćao, {user?.user_metadata?.username || 'Warrior'}! 👋
          </h1>
          <p className="text-gray-400">Spreman za trening?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/gym')}
            className="bg-gradient-to-br from-gym-orange to-orange-600 rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <Dumbbell size={32} className="mb-3" />
            <h3 className="font-bold text-lg">Gym</h3>
            <p className="text-sm opacity-90">Treninge</p>
          </button>

          <button
            onClick={() => navigate('/running')}
            className="bg-gradient-to-br from-run-cyan to-teal-500 rounded-2xl p-6 text-left text-enduro-dark active:scale-95 transition-transform"
          >
            <Activity size={32} className="mb-3" />
            <h3 className="font-bold text-lg">Running</h3>
            <p className="text-sm opacity-90">Trčanje</p>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold px-1">Ove nedelje</h2>
          
          <div className="bg-enduro-gray rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gym-orange/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-gym-orange" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-400">Treninga</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-success-green text-sm">↑ 2 više</p>
                <p className="text-xs text-gray-500">od prošle</p>
              </div>
            </div>
          </div>

          <div className="bg-enduro-gray rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-run-cyan/20 rounded-lg flex items-center justify-center">
                  <Activity className="text-run-cyan" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">12.5 km</p>
                  <p className="text-sm text-gray-400">Istrčano</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold px-1">Nedavno</h2>
          
          <div className="bg-enduro-gray rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div className="flex-1">
                <p className="font-semibold">Upper Body A</p>
                <p className="text-sm text-gray-400">Danas, 18:30</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gym-orange">8 vežbi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}