export type Role = 'ADMIN' | 'HOST' | 'GUEST'

export type User = {
  id?: number
  name?: string
  email: string
  role: Role
}

export type RegisterData = {
  name: string
  email: string
  password: string
  role: 'HOST' | 'GUEST'
}

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
    role?: Role,
  ) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}