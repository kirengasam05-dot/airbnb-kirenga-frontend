import { api } from '../../../lib/axios'

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
  role: 'HOST' | 'GUEST'
}

export const loginRequest = async (
  data: LoginData,
) => {
  const response = await api.post(
    '/auth/login',
    data,
  )

  return response.data
}

export const registerRequest = async (
  data: RegisterData,
) => {
  const response = await api.post(
    '/auth/register',
    data,
  )

  return response.data
}