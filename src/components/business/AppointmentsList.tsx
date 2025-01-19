import React from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Button,
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import useSWR from 'swr'

interface Appointment {
  id: string
  customerName: string
  serviceName: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface AppointmentsListProps {
  businessId: string
}

const appointmentService = {
  getAppointments: async (businessId: string) => {
    // Simulated API call
    return [
      {
        id: '1',
        customerName: 'John Doe',
        serviceName: 'Haircut',
        startTime: '2024-01-16T10:00:00',
        endTime: '2024-01-16T11:00:00',
        status: 'confirmed',
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        serviceName: 'Manicure',
        startTime: '2024-01-16T11:30:00',
        endTime: '2024-01-16T12:30:00',
        status: 'pending',
      },
    ] as Appointment[]
  },
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ businessId }) => {
  const { data: appointments, error } = useSWR(
    businessId ? ['appointments', businessId] : null,
    () => appointmentService.getAppointments(businessId)
  )

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="error">
          Error loading appointments
        </Typography>
      </Box>
    )
  }

  if (!appointments) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (appointments.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No appointments found
        </Typography>
      </Box>
    )
  }

  return (
    <List>
      {appointments.map((appointment) => (
        <ListItem key={appointment.id}>
          <ListItemAvatar>
            <Avatar>
              {/* <PersonIcon /> */}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={appointment.customerName}
            secondary={format(parseISO(appointment.startTime), 'PPpp')}
          />
          <Chip
            label={appointment.status}
            color={
              appointment.status === 'confirmed'
                ? 'success'
                : appointment.status === 'pending'
                ? 'warning'
                : 'error'
            }
            size="small"
          />
        </ListItem>
      ))}
    </List>
  )
}

export default AppointmentsList
