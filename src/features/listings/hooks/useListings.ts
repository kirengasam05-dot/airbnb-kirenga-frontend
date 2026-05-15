import { useQuery } from '@tanstack/react-query'

import { fallbackListings } from '../../../data/listings'

import { getListingsRequest } from '../api/listingsApi'

import type { ApiListing, Listing } from '../types'

import { mapApiListing } from './mapListing'

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ['listings'],

    queryFn: async () => {
      try {
        const response = await getListingsRequest()

        const rawListings = (
          response?.data ??
          response?.listings ??
          response
        ) as ApiListing[]

        return rawListings.map(mapApiListing)
      } catch {
        return fallbackListings
      }
    },
  })
}