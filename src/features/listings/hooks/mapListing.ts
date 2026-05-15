import type {
  ApiListing,
  Listing,
  ListingCategory,
} from '../types'

const fallbackImages = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
]

function categoryFromType(type?: string): ListingCategory {
  if (type === 'CABIN') return 'mountain'
  if (type === 'VILLA') return 'countryside'
  if (type === 'HOUSE') return 'city'

  return 'city'
}

export function mapApiListing(item: ApiListing): Listing {
  const photo =
    item.photos?.[0]?.url ??
    item.photos?.[0]?.imageUrl

  const price = Number(
    item.pricePerNight ?? item.price ?? 0,
  )

  const hostId =
    item.hostId ??
    item.userId ??
    item.host?.id

  return {
    id: Number(item.id),
    title: item.title,
    description: item.description,
    location: item.location,
    price,
    pricePerNight: price,
    rating: Number(item.rating ?? 4.85),
    superhost: Boolean(
      item.superhost ?? item.host?.role === 'HOST',
    ),
    available: item.available ?? true,
    availableFrom:
      item.availableFrom ?? new Date().toISOString(),

    img:
      item.img ??
      item.image ??
      photo ??
      fallbackImages[item.id % fallbackImages.length],

    image: item.image ?? item.img ?? photo,

    category: categoryFromType(item.type),
    type: item.type,
    guests: item.guests ?? 2,
    amenities: item.amenities ?? [],

    hostId,
    host: item.host,
  }
}

export function unwrapListings(
  payload: unknown,
): ApiListing[] {
  if (Array.isArray(payload)) {
    return payload as ApiListing[]
  }

  if (payload && typeof payload === 'object') {
    const value = payload as Record<string, unknown>

    if (Array.isArray(value.data)) {
      return value.data as ApiListing[]
    }

    if (Array.isArray(value.listings)) {
      return value.listings as ApiListing[]
    }

    if (
      value.data &&
      typeof value.data === 'object'
    ) {
      const data = value.data as Record<string, unknown>

      if (Array.isArray(data.listings)) {
        return data.listings as ApiListing[]
      }

      if (Array.isArray(data.items)) {
        return data.items as ApiListing[]
      }
    }
  }

  return []
}