export type ListingCategory =
  | 'beach'
  | 'mountain'
  | 'city'
  | 'countryside'

export type ListingType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'CABIN'

export interface Listing {
  id: number
  title: string
  description?: string
  location: string
  price: number
  pricePerNight?: number
  rating: number
  superhost: boolean
  available: boolean
  availableFrom: string
  img: string
  image?: string
  category: ListingCategory
  type?: ListingType
  guests?: number
  amenities?: string[]

  hostId?: number
  host?: {
    id?: number
    name?: string
    email?: string
    role?: string
  }
}

export interface ApiListing {
  id: number
  title: string
  description?: string
  location: string
  pricePerNight?: number
  price?: number
  rating?: number
  type?: ListingType
  guests?: number
  amenities?: string[]
  image?: string
  img?: string
  photos?: Array<{
    url?: string
    imageUrl?: string
  }>
  available?: boolean
  availableFrom?: string
  superhost?: boolean

  hostId?: number
  userId?: number
  host?: {
    id?: number
    name?: string
    email?: string
    role?: string
  }
}