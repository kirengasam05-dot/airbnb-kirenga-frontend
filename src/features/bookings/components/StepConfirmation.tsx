import type { BookingData } from '../schemas/booking'
import './StepConfirmation.css'
import './StepConfirmation.css'

export function StepConfirmation({
  data,
  onBack,
  onSubmit,
}: {
  data: BookingData
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div className="confirmation-card">
      <h2>Confirm booking</h2>

      <div className="confirmation-summary">
        <div className="summary-row">
          <span>Check-in</span>
          <strong>{data.checkIn}</strong>
        </div>

        <div className="summary-row">
          <span>Check-out</span>
          <strong>{data.checkOut}</strong>
        </div>

        <div className="summary-row">
          <span>Guests</span>
          <strong>{data.guests}</strong>
        </div>

        <div className="summary-row">
          <span>Guest Name</span>
          <strong>{data.name}</strong>
        </div>

        <div className="summary-row">
          <span>Email</span>
          <strong>{data.email}</strong>
        </div>

        <div className="summary-row">
          <span>Phone</span>
          <strong>{data.phone}</strong>
        </div>

        <div className="summary-row">
          <span>Payment Card</span>

          <strong>
            **** **** ****{' '}
           {data.card?.slice(-4) || '0000'}
          </strong>
        </div>

        {data.photo?.[0] && (
          <div className="summary-row">
            <span>Uploaded Photo</span>

            <strong>
              {data.photo[0].name}
            </strong>
          </div>
        )}
      </div>

      <div className="confirmation-actions">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="confirm-btn"
          onClick={onSubmit}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  )
}