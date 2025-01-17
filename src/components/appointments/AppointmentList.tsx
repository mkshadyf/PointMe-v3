import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Typography,
  Box,
  Skeleton,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { format, parseISO } from 'date-fns'
import type { Appointment } from '../../types/appointment'
import { useMutation, useQueryClient } from 'react-query'
import appointmentService from '../../services/appointmentService'
import AppointmentDetailsDialog from './AppointmentDetailsDialog'
import EditAppointmentDialog from './EditAppointmentDialog'

interface AppointmentListProps {
  appointments: Appointment[]
  isLoading: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
}) => {
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      appointmentService.updateAppointmentStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
      },
    }
  )

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    appointment: Appointment
  ) => {
    setAnchorEl(event.currentTarget)
    setSelectedAppointment(appointment)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleStatusChange = async (status: string) => {
    if (selectedAppointment) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedAppointment.id,
          status,
        })
        // Show success notification
      } catch (error) {
        console.error('Failed to update appointment status:', error)
        // Show error notification
      }
    }
    handleMenuClose()
  }

  const handleViewDetails = () => {
    setIsDetailsOpen(true)
    handleMenuClose()
  }

  const handleEdit = () => {
    setIsEditOpen(true)
    handleMenuClose()
  }

  if (isLoading) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={60}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    )
  }

  if (!appointments.length) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No appointments found for the selected date.
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {format(parseISO(appointment.startTime), 'h:mm a')}
                </TableCell>
                <TableCell>{appointment.customerName}</TableCell>
                <TableCell>{appointment.serviceName}</TableCell>
                <TableCell>{appointment.duration} min</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, appointment)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={() => handleStatusChange('confirmed')}>
          Mark as Confirmed
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('cancelled')}>
          Cancel Appointment
        </MenuItem>
      </Menu>

      {selectedAppointment && (
        <>
          <AppointmentDetailsDialog
            appointment={selectedAppointment}
            open={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
          />
          <EditAppointmentDialog
            appointment={selectedAppointment}
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
        </>
      )}
    </>
  )
}

export default AppointmentList
