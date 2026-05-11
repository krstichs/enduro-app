import { AuthLayout } from '../components/auth/AuthLayout'
import { SignupForm } from '../components/auth/SignupForm'

export function Signup() {
  return (
    <AuthLayout 
      title="Start your fitness journey" 
      subtitle="Create your free account"
    >
      <SignupForm />
    </AuthLayout>
  )
}