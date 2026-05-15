import { useState } from 'react'
import toast from 'react-hot-toast'

import { createBookingRequest } from '../api/bookingsApi'

import type { BookingData } from '../schemas/booking'

export function useBooking(listingId: number) {
  const [currentStep, setCurrentStep] = useState(0)

  const [data, setData] = useState<BookingData>({})

  const next = (stepData: BookingData) => {
    setData((prev) => ({
      ...prev,
      ...stepData,
    }))

    setCurrentStep((step) =>
      Math.min(step + 1, 3),
    )
  }

  const back = () => {
    setCurrentStep((step) =>
      Math.max(step - 1, 0),
    )
  }

  const submit = async () => {
    const payload = {
      listingId,
      checkIn: data.checkIn ?? '',
      checkOut: data.checkOut ?? '',
      guests: Number(data.guests ?? 1),
    }

    try {
      await createBookingRequest(payload)

      toast.success('Booking confirmed successfully')
    } catch (error) {
      console.error('BOOKING ERROR:', error)

      toast.error('Failed to create booking')
    }
  }

  return {
    currentStep,
    data,
    next,
    back,
    submit,
  }
}