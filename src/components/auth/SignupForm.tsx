import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password mora biti minimum 6 karaktera')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, username)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
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
          placeholder="tvoje_ime"
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
          placeholder="tvoj@email.com"
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
        <p className="text-xs text-gray-500 mt-1">Minimum 6 karaktera</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-run-cyan hover:bg-teal-500 text-enduro-dark font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Kreiranje naloga...' : 'Kreiraj nalog'}
      </button>

      <p className="text-center text-gray-400 text-sm">
        Već imaš account?{' '}
        <Link to="/login" className="text-run-cyan hover:text-teal-400 font-medium">
          Prijavi se
        </Link>
      </p>
    </form>
  )
}