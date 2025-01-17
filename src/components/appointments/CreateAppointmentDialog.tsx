import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import appointmentService from '../../services/appointmentService'
import businessService from '../../../services/businessService'
import type { Service } from '../../types/business'
import type { CreateAppointmentInput } from '../../types/appointment'
import { useAuthStore } from '../../stores/authStore'
import { format } from 'date-fns'

interface CreateAppointmentDialogProps {
  open: boolean
  onClose: () => void
  selectedDate: Date
}

const appointmentSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  serviceId: z.string().min(1, 'Service is required'),
  startTime: z.date(),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({
  open,
  onClose,
  selectedDate,
}) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: services } = useQuery(
    ['services', user?.id],
    () => businessService.getServices(user!.id),
    {
      enabled: !!user,
    }
  )

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      serviceId: '',
      startTime: selectedDate,
      notes: '',
    },
  })

  const selectedServiceId = watch('serviceId')
  const selectedService = services?.find(
    (service) => service.id === selectedServiceId
  )

  const createMutation = useMutation(
    (data: any) => appointmentService.createAppointment({
      businessId: user!.id,
      serviceId: data.serviceId,
      date: format(data.startTime, 'yyyy-MM-dd'),
      startTime: format(data.startTime, 'HH:mm'),
      customerId: data.customerId,
      notes: data.notes
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
        handleClose()
      },
    }
  )

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      // Show success notification
    } catch (error) {
      console.error('Failed to create appointment:', error)
      // Show error notification
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>New Appointment</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="customerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Customer Name"
                    fullWidth
                    error={!!errors.customerName}
                    helperText={errors.customerName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="customerEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.customerEmail}
                    helperText={errors.customerEmail?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="customerPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    error={!!errors.customerPhone}
                    helperText={errors.customerPhone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Appointment Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.serviceId}>
                    <InputLabel>Service</InputLabel>
                    <Select {...field} label="Service">
                      {services?.map((service) => (
                        <MenuItem
                          key={service.id}
                          value={service.id}
                          disabled={!service.isActive}
                        >
                          {service.name} (${service.price})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="Date & Time"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.startTime,
                        helperText: errors.startTime?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {selectedService && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">
                      Service Details:
                    </Typography>
                    <Typography variant="body2">
                      Duration: {selectedService.duration} minutes
                      <br />
                      Price: ${selectedService.price}
                    </Typography>
                  </Alert>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            Create Appointment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateAppointmentDialog

