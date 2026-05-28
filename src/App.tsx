import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { GymTemplates } from './pages/GymTemplates'
import { GymTemplateCreator } from './pages/GymTemplateCreator'
import { GymTemplateEditor } from './pages/GymTemplateEditor'
import { GymTemplateDetail } from './pages/GymTemplateDetail'
import { GymWorkoutTracker } from './pages/GymWorkoutTracker'
import { GymWorkoutComplete } from './pages/GymWorkoutComplete'
import { Settings } from './pages/Settings'
import { Profile } from './pages/Profile'
import { RunningTemplates } from './pages/RunningTemplates'
import { RunningTemplateCreator } from './pages/RunningTemplateCreator'
import { QuickLogRun } from './pages/QuickLogRun'
import { WorkoutDetail } from './pages/WorkoutDetail'
import { Admin } from './pages/Admin'
import { RunningDetail } from './pages/RunningDetail'
import { ToastProvider } from './contexts/ToastContext'
import React from 'react';
import { ScrollToTop } from './components/ScrollToTop'
import { Progress } from './pages/Progress'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { AddExercise } from './pages/AddExercise'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-enduro-dark flex items-center justify-center">
        <div className="text-enduro-light text-xl">Učitavanje...</div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

// Public Route (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-enduro-dark flex items-center justify-center">
        <div className="text-enduro-light text-xl">Loading...</div>
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
  {/* Auth Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/* Protected Routes */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
  <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
  <Route path="/workout/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
  <Route path="/running/session/:id" element={<ProtectedRoute><RunningDetail /></ProtectedRoute>} />

  {/* Exercise Routes */}
  <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
  <Route path="/exercises/add" element={<ProtectedRoute><AddExercise /></ProtectedRoute>} />

  {/* Gym Routes */}
  <Route path="/gym" element={<ProtectedRoute><GymTemplates /></ProtectedRoute>} />
  <Route path="/gym/new" element={<ProtectedRoute><GymTemplateCreator /></ProtectedRoute>} />
  <Route path="/gym/template/:id" element={<ProtectedRoute><GymTemplateDetail /></ProtectedRoute>} />
  <Route path="/gym/template/:id/edit" element={<ProtectedRoute><GymTemplateEditor /></ProtectedRoute>} />
  <Route path="/gym/workout/:id/start" element={<ProtectedRoute><GymWorkoutTracker /></ProtectedRoute>} />
  <Route path="/gym/workout/:id/complete" element={<ProtectedRoute><GymWorkoutComplete /></ProtectedRoute>} />

  {/* Running Routes */}
  <Route path="/running" element={<ProtectedRoute><RunningTemplates /></ProtectedRoute>} />
  <Route path="/running/new" element={<ProtectedRoute><RunningTemplateCreator /></ProtectedRoute>} />
  <Route path="/running/log" element={<ProtectedRoute><QuickLogRun /></ProtectedRoute>} />

  {/* Catch All */}
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>

    

    
  )
}


function App() {
  return (
    <React.StrictMode>
      <BrowserRouter> 
      <ScrollToTop /> 
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

export default App