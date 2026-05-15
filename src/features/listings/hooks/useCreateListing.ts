import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createListingRequest,
  type CreateListingData,
} from '../api/listingsApi'

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateListingData) => createListingRequest(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings'],
      })
    },
  })
}