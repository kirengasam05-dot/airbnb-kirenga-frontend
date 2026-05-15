import { api } from '../../../lib/axios'

export type AiSearchData = {
  query: string
  page?: number
  limit?: number
}

export const aiSearchRequest = async (
  data: AiSearchData,
) => {
  const response = await api.post(
    '/ai/search',
    {
      query: data.query,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
    },
  )

  return response.data
}

export const aiChatRequest = async (
  message: string,
) => {
  const response = await api.post(
    '/ai/chat',
    {
      message,
    },
  )

  return response.data
}

export const getAiReviewSummaryRequest =
  async (listingId: number) => {
    const response = await api.get(
      `/ai/listings/${listingId}/review-summary`,
    )

    return response.data
  }

export const aiRecommendationsRequest =
  async (preferences: string) => {
    const response = await api.post(
      '/ai/recommendations',
      {
        preferences,
      },
    )

    return response.data
  }