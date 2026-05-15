import { FormEvent, useState } from 'react'

type CheckoutFormProps = {
  bookingId?: number
  amount?: number
  onSuccess: () => void
}

export function CheckoutForm({
  bookingId,
  amount,
  onSuccess,
}: CheckoutFormProps) {
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!cardName || !cardNumber || !expiry || !cvv) {
      alert('Please fill all payment fields')
      return
    }

    const payment = {
      id: Date.now(),
      bookingId,
      amount,
      cardName,
      cardLast4: cardNumber.slice(-4),
      status: 'PAID',
      paidAt: new Date().toISOString(),
    }

    const existingPayments = JSON.parse(
      localStorage.getItem('payments') || '[]',
    )

    localStorage.setItem(
      'payments',
      JSON.stringify([...existingPayments, payment]),
    )

    alert('Payment successful')
    onSuccess()
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <label>
        Name on card
        <input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Kirenga Sam"
        />
      </label>

      <label>
        Card number
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
        />
      </label>

      <div className="checkout-grid">
        <label>
          Expiry
          <input
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="12/28"
          />
        </label>

        <label>
          CVV
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="123"
            maxLength={4}
          />
        </label>
      </div>

      <button type="submit">Pay now</button>
    </form>
  )
}