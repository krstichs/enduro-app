import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false) // Prati da li je uspešno poslat mejl
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, username)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      // Pošto je uključen email confirmation, ne idemo na dashboard 
      // nego palimo stanje za prikaz uspešne registracije
      setIsRegistered(true)
    }
  }

  // Ekran koji se prikazuje kada uspešno prođe signUp, a čeka se potvrda sa mejla
  if (isRegistered) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-run-cyan/30 text-center space-y-4 animate-fade-in bg-white/[0.01]">
        <div className="w-16 h-16 bg-run-cyan/10 border border-run-cyan/30 rounded-full flex items-center justify-center mx-auto text-2xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          ✉️
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-wider">Check your email!</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          We've sent a confirmation link to <span className="text-run-cyan font-semibold">{email}</span>. 
          Please click the link in the email to activate your account.
        </p>
        <Link 
          to="/login" 
          className="block w-full bg-run-cyan hover:bg-teal-500 text-enduro-dark font-bold py-3 rounded-lg transition-colors text-center mt-6"
        >
          Go to Login Screen
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-3 bg-enduro-dark border border-gray-600 rounded-lg text-enduro-light focus:outline-none focus:border-run-cyan transition-colors"
          placeholder="your_username"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-enduro-dark border border-gray-600 rounded-lg text-enduro-light focus:outline-none focus:border-run-cyan transition-colors"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 bg-enduro-dark border border-gray-600 rounded-lg text-enduro-light focus:outline-none focus:border-run-cyan transition-colors"
          placeholder="••••••••"
        />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-run-cyan hover:bg-teal-500 text-enduro-dark font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-gray-400 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-run-cyan hover:text-teal-400 font-medium">
          Log in
        </Link>
      </p>
    </form>
  )
}