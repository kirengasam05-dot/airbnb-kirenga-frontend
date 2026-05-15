import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

import './LoginPage.css'

type Role = 'ADMIN' | 'HOST' | 'GUEST'
type RegisterRole = 'HOST' | 'GUEST'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, login, register } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    navigate('/dashboard', { replace: true })
  }, [isAuthenticated, user, navigate])

  const handleLogin = async (
    email: string,
    password: string,
    role?: Role,
  ) => {
    await login(email, password, role)
  }

  const handleRegister = async (data: {
    name: string
    email: string
    password: string
    role: RegisterRole
  }) => {
    await register(data)
  }

  return (
    <main className="auth-page">
      <LoginForm
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </main>
  )
}