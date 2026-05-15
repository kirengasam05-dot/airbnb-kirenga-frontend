import { useBooking } from '../hooks/useBooking';
import { StepDates } from './StepDates';
import { StepPersonal } from './StepPersonal';
import { StepPayment } from './StepPayment';
import { StepConfirmation } from './StepConfirmation';
export function BookingForm({ listingId }: { listingId: number }) { const booking = useBooking(listingId); return <section className="booking"><p>Step {booking.currentStep + 1} of 4</p>{booking.currentStep===0 && <StepDates onNext={booking.next}/>} {booking.currentStep===1 && <StepPersonal onNext={booking.next} onBack={booking.back}/>} {booking.currentStep===2 && <StepPayment onNext={booking.next} onBack={booking.back}/>} {booking.currentStep===3 && <StepConfirmation data={booking.data} onBack={booking.back} onSubmit={booking.submit}/>}</section>; }
