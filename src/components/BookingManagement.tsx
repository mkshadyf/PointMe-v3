import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { trpc } from '../utils/trpc'
import { TRPCClientErrorLike } from '@trpc/client'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuthStore from '@/stores/authStore'
import { Booking } from '@/types/booking'
 
const bookingSchema = z.object({
  startTime: z.date(),
  notes: z.string().optional()
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingManagementProps {
  businessId: string
  serviceId: string
}

const BookingManagement: React.FC<BookingManagementProps> = ({
  businessId,
  serviceId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const utils = trpc.useContext()

  const { data: bookings } = trpc.booking.list.useQuery({
    serviceId,
    userId: useAuthStore.getState().user?.id
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: editingBooking ? {
      startTime: new Date(editingBooking.startTime),
      notes: editingBooking.notes || ''
    } : {
      startTime: new Date(),
      notes: ''
    }
  })

  const createMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      utils.booking.list.invalidate()
      handleCloseDialog()
      toast.success('Booking created')
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  const updateMutation = trpc.booking.update.useMutation({
    onSuccess: () => {
      utils.booking.list.invalidate()
      handleCloseDialog()
      toast.success('Booking updated')
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  const cancelMutation = trpc.booking.cancel.useMutation({
    onSuccess: () => {
      utils.booking.list.invalidate()
      toast.success('Booking cancelled')
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      setError(error.message)
      toast.error(error.message)
    }
  })

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    setError(null)
    setEditingBooking(null)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setError(null)
    setEditingBooking(null)
    reset()
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setValue('startTime', new Date(booking.startTime))
    setValue('notes', booking.notes || '')
    setIsDialogOpen(true)
  }

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate({ bookingId: bookingId })
    }
  }

  const onSubmit = (data: BookingFormData) => {
    setError(null)
    if (editingBooking) {
      updateMutation.mutate({
        bookingId: editingBooking.id,
        startTime: data.startTime,
        endTime: new Date(data.startTime.getTime() + 60 * 60 * 1000), // 1 hour after start time
        notes: data.notes
      })
    } else {
      createMutation.mutate({
        serviceId,
        startTime: data.startTime,
        endTime: new Date(data.startTime.getTime() + 60 * 60 * 1000), // 1 hour after start time
        notes: data.notes
      })
    }
  }

  if (!bookings) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Bookings</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          New Booking
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {new Date(booking.startTime).toLocaleString()}
                </TableCell>
                <TableCell>{booking.service.name}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(booking)}
                  >
                    Edit
                  </Button>
                  {booking.status !== 'cancelled' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingBooking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Date & Time"
                onChange={(date) => setValue('startTime', date || new Date())}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              {...register('notes')}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : editingBooking
                ? 'Update'
                : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingManagement