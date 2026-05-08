import { useAuth } from '../contexts/AuthContext'
import { PageLayout } from '../components/layout/PageLayout'
import { Dumbbell, Activity, Flame, TrendingUp, Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const username = user?.user_metadata?.username || 'Warrior'

  return (
    <PageLayout showBottomNav>
      <div className="min-h-screen bg-gradient-to-b from-enduro-darker via-enduro-dark to-enduro-darker">
        {/* Hero Section */}
        <div className="relative px-4 pt-6 pb-8">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gym-orange/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-black">
              Ćao, <span className="bg-gym-gradient bg-clip-text">{username}</span>! 👋
            </h1>
            <p className="text-gray-400 text-lg">Vreme je za akciju</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="px-4 mb-6 animate-slide-up">
          <div className="glass-card rounded-3xl p-6 border-2 border-gym-orange/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gym-orange/30 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 bg-gym-gradient rounded-full flex items-center justify-center">
                    <Flame size={32} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black">12</p>
                  <p className="text-gray-400 text-sm">Dana zaredom</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-success-green font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  Novi rekord!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Type Cards */}
        <div className="px-4 mb-8 space-y-4 animate-scale-in">
          {/* Gym Card */}
          <button
            onClick={() => navigate('/gym')}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-3xl">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gym-gradient opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
              
              {/* Card Content */}
              <div className="relative gradient-card-gym rounded-3xl p-6 group-active:scale-98 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gym-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-gym-orange/30">
                      <Dumbbell size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold mb-1">Gym Workout</h3>
                      <p className="text-gray-400">Započni snažan trening</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gym-orange">3</p>
                    <p className="text-xs text-gray-500">treninga</p>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Running Card */}
          <button
            onClick={() => navigate('/running')}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-3xl">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-run-gradient opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
              
              {/* Card Content */}
              <div className="relative gradient-card-run rounded-3xl p-6 group-active:scale-98 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-run-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-run-cyan/30">
                      <Activity size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold mb-1">Running</h3>
                      <p className="text-gray-400">Trči ka cilju</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-run-cyan">12.5</p>
                    <p className="text-xs text-gray-500">km ove nedelje</p>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Ove nedelje</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <div className="text-gym-orange mb-2">
                <Clock size={24} />
              </div>
              <p className="text-3xl font-black mb-1">4.5h</p>
              <p className="text-gray-500 text-sm">Treninga</p>
            </div>

            <div className="stat-card">
              <div className="text-run-cyan mb-2">
                <TrendingUp size={24} />
              </div>
              <p className="text-3xl font-black mb-1">+15%</p>
              <p className="text-gray-500 text-sm">Progres</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 pb-24">
          <h2 className="text-xl font-bold mb-4">Nedavna aktivnost</h2>
          
          <div className="space-y-3">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gym-orange/20 rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} className="text-gym-orange" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Upper Body A</p>
                  <p className="text-sm text-gray-400">Danas • 45 min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gym-orange">8 vežbi</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-run-cyan/20 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-run-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Morning Run</p>
                  <p className="text-sm text-gray-400">Juče • 5.2 km</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-run-cyan">28:45</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gym-orange/20 rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} className="text-gym-orange" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Leg Day</p>
                  <p className="text-sm text-gray-400">Pre 2 dana • 50 min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gym-orange">6 vežbi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}