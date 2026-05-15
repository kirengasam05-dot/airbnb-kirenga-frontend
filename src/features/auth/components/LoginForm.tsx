import { FormEvent, useState } from 'react'
import {
  FaApple,
  FaEnvelope,
  FaFacebook,
  FaGoogle,
  FaXmark,
} from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

import './LoginForm.css'

type RegisterRole = 'GUEST' | 'HOST'
type Role = 'ADMIN' | 'GUEST' | 'HOST'

type LoginFormProps = {
  onLogin: (email: string, password: string, role?: Role) => void
  onRegister: (data: {
    name: string
    email: string
    password: string
    role: RegisterRole
  }) => void
}

export function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('GUEST')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isRegister) {
      onRegister({
        name,
        email,
        password,
        role,
      })

      setIsRegister(false)
      setPassword('')
      return
    }

    onLogin(email, password)
  }

  function handleSocialLogin() {
    alert('Social login will be connected later with OAuth.')
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <button
          type="button"
          className="login-close"
          onClick={() => navigate('/')}
        >
          <FaXmark />
        </button>

        <strong>{isRegister ? 'Create account' : 'Log in or sign up'}</strong>

        <span></span>
      </div>

      <form onSubmit={handleSubmit} className="login-body">
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>

        <p className="login-subtitle">
          {isRegister
            ? 'Join Airbnb Stays as a guest or host.'
            : 'Sign in to continue to your Airbnb Stays dashboard.'}
        </p>

        {isRegister && (
          <label className="login-field">
            <span>Full name</span>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}

        <div className="login-input-group">
          <label className="login-field clean">
            <span>Email address</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="login-field clean">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
        </div>

        {isRegister && (
          <label className="login-field">
            <span>Account type</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as RegisterRole)}
            >
              <option value="GUEST">Guest</option>
              <option value="HOST">Host</option>
            </select>
          </label>
        )}

        <p className="login-note">
          By continuing, you agree to Airbnb Stays terms and privacy policy.
        </p>

        <button className="continue-btn" type="submit">
          {isRegister ? 'Create account' : 'Continue'}
        </button>

        <button
          type="button"
          className="auth-toggle-btn"
          onClick={() => setIsRegister((current) => !current)}
        >
          {isRegister
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </button>

        {!isRegister && (
          <>
            <div className="login-divider">
              <span></span>
              <small>or</small>
              <span></span>
            </div>

            <button
              type="button"
              className="social-btn"
              onClick={handleSocialLogin}
            >
              <FaGoogle />
              Continue with Google
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={handleSocialLogin}
            >
              <FaApple />
              Continue with Apple
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={handleSocialLogin}
            >
              <FaEnvelope />
              Continue with email
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={handleSocialLogin}
            >
              <FaFacebook />
              Continue with Facebook
            </button>
          </>
        )}
      </form>
    </div>
  )
}