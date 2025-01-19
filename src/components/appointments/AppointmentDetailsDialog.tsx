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
  ChipProps,
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import { Appointment } from '../../types/appointment'
import { AppointmentStatus } from '../../types/enums'
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
  businessId: string
}

const getStatusColor = (status: AppointmentStatus): ChipProps['color'] => {
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

interface DetailItemProps {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
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
  businessId,
}) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  const handleEdit = () => {
    setIsEditOpen(true)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: appointment.currency || 'USD',
    }).format(amount)
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
                  color={getStatusColor(appointment.status)}
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
                <DetailItem
                  icon={<EventIcon />}
                  label="Customer ID"
                  value={appointment.customerId}
                />
                <DetailItem
                  icon={<EventIcon />}
                  label="Service"
                  value={appointment.service?.name || 'N/A'}
                />
                <DetailItem
                  icon={<AccessTimeIcon />}
                  label="Start Time"
                  value={format(parseISO(appointment.startTime), 'MMMM d, yyyy h:mm a')}
                />
                <DetailItem
                  icon={<AccessTimeIcon />}
                  label="End Time"
                  value={format(parseISO(appointment.endTime), 'MMMM d, yyyy h:mm a')}
                />
                <DetailItem
                  icon={<EventIcon />}
                  label="Status"
                  value={appointment.status}
                />
                {appointment.paymentStatus && (
                  <DetailItem
                    icon={<AttachMoneyIcon />}
                    label="Payment Status"
                    value={appointment.paymentStatus}
                  />
                )}
                {appointment.paymentAmount && (
                  <DetailItem
                    icon={<AttachMoneyIcon />}
                    label="Payment Amount"
                    value={formatCurrency(appointment.paymentAmount)}
                  />
                )}
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
