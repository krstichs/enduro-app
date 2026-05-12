import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { GymTemplates } from './pages/GymTemplates'
import { GymTemplateCreator } from './pages/GymTemplateCreator'
import { GymTemplateEditor } from './pages/GymTemplateEditor'


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
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* GYM ROUTES */}
      <Route
        path="/gym"
        element={
          <ProtectedRoute>
            <GymTemplates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gym/new"
        element={
          <ProtectedRoute>
            <GymTemplateCreator />
          </ProtectedRoute>
        }
      />


            <Route
        path="/gym/template/:id/edit"
        element={
          <ProtectedRoute>
            <GymTemplateEditor />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App