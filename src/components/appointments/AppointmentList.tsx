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
import { format } from 'date-fns'
import { Appointment } from '../../types/appointment'
import { AppointmentStatus } from '../../types/enums'
import useSWR from 'swr'
import { appointmentService } from '../../services/appointmentService'
import AppointmentDetailsDialog from './AppointmentDetailsDialog'
import { showNotification } from '../../utils/notification'

interface AppointmentListProps {
  businessId: string
  appointments?: Appointment[]
  isLoading?: boolean
}

const getStatusColor = (status: AppointmentStatus): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return 'success'
    case AppointmentStatus.PENDING:
      return 'warning'
    case AppointmentStatus.CANCELLED:
      return 'error'
    default:
      return 'default'
  }
}

const AppointmentList: React.FC<AppointmentListProps> = ({ businessId, appointments = [], isLoading = false }) => {
  const { data: fetchedAppointments, mutate } = useSWR<Appointment[]>(
    ['appointments', businessId],
    () => appointmentService.getAppointments({ businessId })
  )

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  const handleUpdateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await appointmentService.updateAppointment(appointmentId, { status })
      mutate()
      showNotification('Appointment status updated successfully', { variant: 'success' })
    } catch (error) {
      console.error('Failed to update appointment status:', error)
      showNotification('Failed to update appointment status', { variant: 'error' })
    }
  }

  const displayedAppointments = fetchedAppointments || appointments

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
                <TableCell><Skeleton variant="text" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{format(new Date(appointment.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{appointment.startTime}</TableCell>
                <TableCell>{appointment.customerName}</TableCell>
                <TableCell>{appointment.service?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(event) => {
                      setAnchorEl(event.currentTarget)
                      setSelectedAppointment(appointment)
                    }}
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
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setIsDetailsOpen(true)
          setAnchorEl(null)
        }}>
          View Details
        </MenuItem>
        {selectedAppointment?.status === AppointmentStatus.PENDING && (
          <MenuItem onClick={() => {
            if (selectedAppointment) {
              handleUpdateStatus(selectedAppointment.id, AppointmentStatus.CONFIRMED)
            }
            setAnchorEl(null)
          }}>
            Confirm
          </MenuItem>
        )}
        {selectedAppointment?.status !== AppointmentStatus.CANCELLED && (
          <MenuItem onClick={() => {
            if (selectedAppointment) {
              handleUpdateStatus(selectedAppointment.id, AppointmentStatus.CANCELLED)
            }
            setAnchorEl(null)
          }}>
            Cancel
          </MenuItem>
        )}
      </Menu>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          businessId={businessId}
        />
      )}
    </Box>
  )
}

export default AppointmentList
