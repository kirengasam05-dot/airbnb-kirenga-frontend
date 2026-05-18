import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type SavedListing = {
  id: number
  title: string
}

const STORAGE_KEY = 'savedListings'

export function useFavorites() {
  const [saved, setSaved] = useState<SavedListing[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  const isSaved = useCallback(
    (id: number) => saved.some((item) => item.id === id),
    [saved],
  )

  const toggle = useCallback(
    (id: number, title: string) => {
      const alreadySaved = saved.some((item) => item.id === id)

      setSaved((current) =>
        alreadySaved
          ? current.filter((item) => item.id !== id)
          : [...current, { id, title }],
      )

      toast.success(
        `${alreadySaved ? 'Removed' : 'Saved'}: ${title}`,
      )
    },
    [saved],
  )

  return {
    saved,
    count: saved.length,
    isSaved,
    toggle,
  }
}