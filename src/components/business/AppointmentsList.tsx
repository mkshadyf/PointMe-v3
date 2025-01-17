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
import { format } from 'date-fns'
import { useQuery } from 'react-query'

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

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ businessId }) => {
  // TODO: Replace with actual API call
  const { data: appointments, isLoading } = useQuery<Appointment[]>(
    ['appointments', businessId, 'today'],
    async () => {
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
    }
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (!appointments?.length) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No appointments scheduled for today
        </Typography>
        <Button variant="outlined" color="primary">
          View All Appointments
        </Button>
      </Box>
    )
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {appointments.map((appointment) => (
        <ListItem
          key={appointment.id}
          alignItems="flex-start"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar>{appointment.customerName[0]}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                  {appointment.customerName}
                </Typography>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </Box>
            }
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {appointment.serviceName}
                </Typography>
                {' — '}
                {format(new Date(appointment.startTime), 'h:mm a')} -{' '}
                {format(new Date(appointment.endTime), 'h:mm a')}
              </>
            }
          />
        </ListItem>
      ))}
      <Box textAlign="center" pt={2}>
        <Button variant="text" color="primary">
          View All Appointments
        </Button>
      </Box>
    </List>
  )
}

export default AppointmentsList
