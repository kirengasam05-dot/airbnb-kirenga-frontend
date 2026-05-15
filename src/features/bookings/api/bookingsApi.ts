import { api } from '../../../lib/axios'

export type CreateBookingData = {
  listingId: number
  checkIn: string
  checkOut: string
  guests: number
}

export const getBookingsRequest = async () => {
  const response = await api.get('/bookings')
  return response.data
}

export const getMyBookingsRequest = async () => {
  const response = await api.get('/bookings/me')
  return response.data
}

export const getBookingByIdRequest = async (id: number) => {
  const response = await api.get(`/bookings/${id}`)
  return response.data
}

export const createBookingRequest = async (
  data: CreateBookingData,
) => {
  const response = await api.post('/bookings', {
    listingId: Number(data.listingId),
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: Number(data.guests),
  })

  return response.data
}

export const confirmBookingRequest = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/confirm`)
  return response.data
}

export const cancelBookingRequest = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/cancel`)
  return response.data
}

export const deleteBookingRequest = async (id: number) => {
  const response = await api.delete(`/bookings/${id}`)
  return response.data
}