import { Settings, Dumbbell, Clock, Timer, TrendingUp } from 'lucide-react'

interface WorkoutSettingsProps {
  settings: {
    track_weight: boolean
    track_reps: boolean
    track_time: boolean
    track_distance: boolean
    auto_rest_timer: boolean
    default_rest_seconds: number
  }
  onChange: (settings: any) => void
}

export default function WorkoutSettings({ settings, onChange }: WorkoutSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="text-gym-orange" size={24} />
        <h3 className="text-xl font-bold">Tracking Options</h3>
      </div>

      {/* Track Weight */}
      <label className="flex items-center justify-between p-4 glass-card rounded-xl cursor-pointer active:scale-98 transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gym-orange/20 rounded-lg flex items-center justify-center">
            <Dumbbell size={20} className="text-gym-orange" />
          </div>
          <div>
            <p className="font-semibold">Track Weight</p>
            <p className="text-sm text-gray-400">Log weight for each set</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.track_weight}
          onChange={(e) => onChange({ ...settings, track_weight: e.target.checked })}
          className="w-6 h-6 accent-gym-orange"
        />
      </label>

      {/* Track Reps */}
      <label className="flex items-center justify-between p-4 glass-card rounded-xl cursor-pointer active:scale-98 transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-run-cyan/20 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-run-cyan" />
          </div>
          <div>
            <p className="font-semibold">Track Reps</p>
            <p className="text-sm text-gray-400">Count repetitions</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.track_reps}
          onChange={(e) => onChange({ ...settings, track_reps: e.target.checked })}
          className="w-6 h-6 accent-gym-orange"
        />
      </label>

      {/* Track Time */}
      <label className="flex items-center justify-between p-4 glass-card rounded-xl cursor-pointer active:scale-98 transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-accent-purple" />
          </div>
          <div>
            <p className="font-semibold">Track Time</p>
            <p className="text-sm text-gray-400">Log duration per set (for holds, planks)</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.track_time}
          onChange={(e) => onChange({ ...settings, track_time: e.target.checked })}
          className="w-6 h-6 accent-gym-orange"
        />
      </label>

      {/* Auto Rest Timer */}
      <label className="flex items-center justify-between p-4 glass-card rounded-xl cursor-pointer active:scale-98 transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success-green/20 rounded-lg flex items-center justify-center">
            <Timer size={20} className="text-success-green" />
          </div>
          <div>
            <p className="font-semibold">Auto Rest Timer</p>
            <p className="text-sm text-gray-400">Start timer after each set</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.auto_rest_timer}
          onChange={(e) => onChange({ ...settings, auto_rest_timer: e.target.checked })}
          className="w-6 h-6 accent-gym-orange"
        />
      </label>

      {/* Default Rest Time */}
      {settings.auto_rest_timer && (
        <div className="p-4 glass-card rounded-xl">
          <label className="block mb-3">
            <span className="font-semibold">Default Rest Time</span>
            <p className="text-sm text-gray-400 mt-1">Between sets</p>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="30"
              max="300"
              step="15"
              value={settings.default_rest_seconds}
              onChange={(e) => onChange({ ...settings, default_rest_seconds: parseInt(e.target.value) })}
              className="flex-1 accent-gym-orange"
            />
            <div className="w-20 text-center">
              <span className="text-2xl font-bold text-gym-orange">
                {Math.floor(settings.default_rest_seconds / 60)}:{(settings.default_rest_seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}