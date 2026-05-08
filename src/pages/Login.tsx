import { AuthLayout } from '../components/auth/AuthLayout'
import { LoginForm } from '../components/auth/LoginForm'

export function Login() {
  return (
    <AuthLayout 
      title="Dobrodošao nazad!" 
      subtitle="Prijavi se da nastaviš trening"
    >
      <LoginForm />
    </AuthLayout>
  )
}