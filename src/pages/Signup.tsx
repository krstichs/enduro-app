import { AuthLayout } from '../components/auth/AuthLayout'
import { SignupForm } from '../components/auth/SignupForm'

export function Signup() {
  return (
    <AuthLayout 
      title="Započni svoju fitness putanju" 
      subtitle="Kreiraj besplatan nalog"
    >
      <SignupForm />
    </AuthLayout>
  )
}