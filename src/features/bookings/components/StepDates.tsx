import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { datesSchema, type DatesData } from '../schemas/booking';
export function StepDates({ onNext }: { onNext: (d: DatesData) => void }) { const { register, handleSubmit, formState:{errors} } = useForm<DatesData>({ resolver: zodResolver(datesSchema), defaultValues:{ guests:1 }}); return <form className="form" onSubmit={handleSubmit(onNext)}><h2>Dates</h2><input type="date" {...register('checkIn')}/><small>{errors.checkIn?.message}</small><input type="date" {...register('checkOut')}/><small>{errors.checkOut?.message}</small><input type="number" {...register('guests')}/><small>{errors.guests?.message}</small><button>Continue</button></form>; }
