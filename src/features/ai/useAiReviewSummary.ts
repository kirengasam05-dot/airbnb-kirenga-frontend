import { useQuery } from '@tanstack/react-query'
import { getAiReviewSummaryRequest } from '../auth/api/aiApi'

export function useAiReviewSummary(listingId?: number) {
  return useQuery({
    queryKey: ['ai-review-summary', listingId],
    enabled: Boolean(listingId),
    queryFn: () => getAiReviewSummaryRequest(Number(listingId)),
  })
}