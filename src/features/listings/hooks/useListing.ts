import { useQuery } from '@tanstack/react-query'

import { getListingByIdRequest } from '../api/listingsApi'
import type { Listing } from '../types'
import { mapApiListing } from './mapListing'

export function useListing(id?: number) {
  return useQuery<Listing | null>({
    queryKey: ['listing', id],
    enabled: Boolean(id),

    queryFn: async () => {
      if (!id) return null

      const response = await getListingByIdRequest(id)

      const rawListing =
        response?.data ??
        response?.listing ??
        response

      return mapApiListing(rawListing)
    },
  })
}