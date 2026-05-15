import { createContext, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { loginRequest, registerRequest } from '../api/authApi'

import type { AuthContextValue, RegisterData, User } from '../types'

type Role = 'ADMIN' | 'HOST' | 'GUEST'

const demoUsers: Array<User & { password: string }> = [
  {
    id: 1,
    name: 'System Admin',
    email: 'admin1@gmail.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 2,
    name: 'Sam Host',
    email: 'host1@gmail.com',
    password: 'host123',
    role: 'HOST',
  },
  {
    id: 3,
    name: 'Guest User',
    email: 'guest1@gmail.com',
    password: 'guest123',
    role: 'GUEST',
  },
]

export const AuthContext = createContext<AuthContextValue | null>(null)

function clearSessionData() {
  localStorage.removeItem('bookings')
  localStorage.removeItem('payments')
  localStorage.removeItem('listingSearch')
  localStorage.removeItem('searchGuests')
  localStorage.removeItem('searchDate')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [registeredUsers, setRegisteredUsers] =
    useState<Array<User & { password: string }>>(() => {
      const raw = localStorage.getItem('registeredUsers')
      return raw ? JSON.parse(raw) : []
    })

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as User) : null
  })

  const login = async (email: string, password: string, role?: Role) => {
    clearSessionData()

    const localUser = [...demoUsers, ...registeredUsers].find(
      (item) =>
        item.email === email &&
        item.password === password &&
        (!role || item.role === role),
    )

    if (localUser) {
      const { password: _password, ...safeUser } = localUser

      localStorage.setItem('token', 'temporary-demo-token')
      localStorage.setItem('user', JSON.stringify(safeUser))

      setUser(safeUser)

      toast.success(`Logged in as ${safeUser.role}`)
      return
    }

    try {
      const res = await loginRequest({
        email,
        password,
      })

      const token =
        res?.token ??
        res?.accessToken ??
        res?.data?.token

      const apiUser = res?.user ?? res?.data?.user

      if (!token || !apiUser) {
        throw new Error('Invalid login response')
      }

      const finalUser: User = {
        ...apiUser,
        role: apiUser.role ?? role ?? 'GUEST',
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(finalUser))

      setUser(finalUser)

      toast.success(`Logged in as ${finalUser.role}`)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      clearSessionData()
      setUser(null)

      toast.error('Login failed. Check your email and password.')
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    const existingUser = [...demoUsers, ...registeredUsers].find(
      (item) => item.email === data.email,
    )

    if (existingUser) {
      toast.error('Email already exists')
      return
    }

    try {
      await registerRequest(data)
    } catch {
      // Temporary frontend registration still works if backend register fails
    }

    const newUser: User & { password: string } = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    }

    const nextUsers = [...registeredUsers, newUser]

    setRegisteredUsers(nextUsers)
    localStorage.setItem('registeredUsers', JSON.stringify(nextUsers))

    toast.success('Account created successfully. Please login.')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearSessionData()

    setUser(null)

    toast.success('Logged out')
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, registeredUsers],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}