import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import { Appointment } from '../../types/appointment'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EditAppointmentDialog from './EditAppointmentDialog'

interface AppointmentDetailsDialogProps {
  appointment: Appointment
  open: boolean
  onClose: () => void
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

const DetailItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
}> = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Box
      sx={{
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.secondary',
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  </Box>
)

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  open,
  onClose,
}) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  const handleEdit = () => {
    setIsEditOpen(true)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Appointment Details</Typography>
            <Box>
              <IconButton onClick={handleEdit} size="small">
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status) as any}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Information
              </Typography>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  {appointment.customerName}
                </Typography>
                <DetailItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={appointment.customerEmail}
                />
                <DetailItem
                  icon={<PhoneIcon />}
                  label="Phone"
                  value={appointment.customerPhone}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Appointment Details
              </Typography>
              <Box mb={3}>
                <Typography variant="subtitle1">Customer ID: {appointment.customerId}</Typography>
                <Typography variant="subtitle1">Service: {appointment.service?.name}</Typography>
                <Typography variant="subtitle1">Start Time: {format(parseISO(appointment.startTime), 'MMMM d, yyyy h:mm a')}</Typography>
                <Typography variant="subtitle1">End Time: {format(parseISO(appointment.endTime), 'MMMM d, yyyy h:mm a')}</Typography>
                <Typography variant="subtitle1">Status: {appointment.status}</Typography>
                <Typography variant="subtitle1">Payment Status: {appointment.paymentStatus}</Typography>
                <Typography variant="subtitle1">Payment Amount: ${appointment.paymentAmount}</Typography>
              </Box>
            </Grid>

            {appointment.notes && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {appointment.notes}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {isEditOpen && (
        <EditAppointmentDialog
          appointment={appointment}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}

export default AppointmentDetailsDialog
