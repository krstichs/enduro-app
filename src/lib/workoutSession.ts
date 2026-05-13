export interface SetLog {
  set_number: number
  weight?: number
  reps?: number
  time?: number
  completed: boolean
}

export interface ExerciseProgress {
  exercise_id: number
  exercise_name: string
  target_sets: number
  target_reps: number
  sets: SetLog[]
  currentSet: number
  completed: boolean
}

export interface WorkoutSession {
  template_id: number
  template_name: string
  started_at: Date
  exercises: ExerciseProgress[]
  currentExerciseIndex: number
  track_weight: boolean
  track_reps: boolean
  track_time: boolean
  auto_rest_timer: boolean
  default_rest_seconds: number
}

export function initializeWorkoutSession(
  template: any,
  exercises: any[]
): WorkoutSession {
  return {
    template_id: template.id,
    template_name: template.name,
    started_at: new Date(),
    currentExerciseIndex: 0,
    track_weight: template.track_weight ?? true,
    track_reps: template.track_reps ?? true,
    track_time: template.track_time ?? false,
    auto_rest_timer: template.auto_rest_timer ?? true,
    default_rest_seconds: template.default_rest_seconds ?? 90,
    exercises: exercises.map(ex => ({
      exercise_id: ex.exercise.id,
      exercise_name: ex.exercise.name,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      currentSet: 0,
      completed: false,
      sets: Array.from({ length: ex.target_sets }, (_, i) => ({
        set_number: i + 1,
        weight: undefined,
        reps: ex.target_reps,
        time: undefined,
        completed: false,
      })),
    })),
  }
}