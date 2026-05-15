import { api } from '../../../lib/axios'

export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'

export type CreateListingData = {
  title: string
  description: string
  location: string
  pricePerNight: number
  guests: number
  type: ListingType
  amenities: string[]
  image: string
}

export const getListingsRequest = async () => {
  const response = await api.get('/listings')
  return response.data
}

export const getListingByIdRequest = async (id: number) => {
  const response = await api.get(`/listings/${id}`)
  return response.data
}

export const createListingRequest = async (data: CreateListingData) => {
  const response = await api.post('/listings', data)
  return response.data
}

export const deleteListingRequest = async (id: number) => {
  const response = await api.delete(`/listings/${id}`)
  return response.data
}