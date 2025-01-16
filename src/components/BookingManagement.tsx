import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { trpc } from '../utils/trpc'
import { CreateBookingInput } from '../types/booking'
import PaymentForm from './PaymentForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  startTime: z.string().min(1, 'Start time is required'),
})

const BookingManagement: React.FC = () => {
  const { control, handleSubmit, reset } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
  })
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; amount: number } | null>(null)

  const createBookingMutation = trpc.business.createBooking.useMutation()
  const userBookingsQuery = trpc.business.getUserBookings.useQuery()

  const onSubmit = async (data: CreateBookingInput) => {
    try {
      await createBookingMutation.mutateAsync({
        ...data,
        startTime: new Date(data.startTime),
      })
      reset()
      userBookingsQuery.refetch()
    } catch (error) {
      console.error('Failed to create booking:', error)
    }
  }

  const handlePaymentSuccess = () => {
    setSelectedBooking(null)
    userBookingsQuery.refetch()
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Book a Service
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <Controller
          name="serviceId"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="serviceId"
              label="Service ID"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="startTime"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="startTime"
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Book Service
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Your Bookings
      </Typography>
      {userBookingsQuery.isLoading ? (
        <Typography>Loading bookings...</Typography>
      ) : userBookingsQuery.isError ? (
        <Typography color="error">Error loading bookings</Typography>
      ) : (
        <List>
          {userBookingsQuery.data?.map((booking) => (
            <ListItem key={booking.id}>
              <ListItemText
                primary={`${booking.service.name} - ${booking.status}`}
                secondary={`Start: ${booking.startTime.toLocaleString()} - End: ${booking.endTime.toLocaleString()}`}
              />
              {booking.status === 'pending' && (
                <Button
                  onClick={() => setSelectedBooking({ id: booking.id, amount: booking.service.price })}
                  variant="contained"
                  color="primary"
                >
                  Pay
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)}>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingId={selectedBooking.id}
                amount={selectedBooking.amount}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BookingManagement

