import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteListingRequest } from '../api/listingsApi'

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteListingRequest(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings'],
      })
    },
  })
}