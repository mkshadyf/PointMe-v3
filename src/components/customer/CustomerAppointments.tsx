import React from 'react'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material'
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import useSWR, { useSWRConfig } from 'swr'
import { appointmentService } from '@/services/appointmentService'
import { useAuthStore } from '@/stores/authStore'
import { format, parseISO, isFuture, isPast } from 'date-fns'
import { useNotification } from '@/contexts/NotificationContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const CustomerAppointments: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const { mutate } = useSWRConfig()
  const [tabValue, setTabValue] = React.useState(0)
  const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)

  const { data: appointments, error: appointmentsError } = useSWR(
    user ? ['appointments', user.id] : null,
    () => appointmentService.getCustomerAppointments(user!.id)
  )

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId)
      mutate(['appointments', user!.id])
      showNotification('Appointment cancelled successfully', 'success')
      setCancelDialogOpen(false)
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      showNotification(
        'Failed to cancel appointment. Please try again.',
        'error'
      )
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      handleCancelAppointment(selectedAppointment.id)
    }
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

  const AppointmentCard: React.FC<{ appointment: any }> = ({ appointment }) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              {appointment.serviceName}
            </Typography>
            <Chip
              label={appointment.status}
              color={getStatusColor(appointment.status) as any}
              size="small"
              sx={{ mb: 2 }}
            />
          </Box>
          {appointment.status !== 'cancelled' &&
            isFuture(parseISO(appointment.startTime)) && (
              <Box>
                <IconButton
                  size="small"
                  onClick={() => handleCancelClick(appointment)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <BusinessIcon
                fontSize="small"
                sx={{ color: 'text.secondary', mr: 1 }}
              />
              <Typography variant="body2">
                {appointment.businessName}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <EventIcon
                fontSize="small"
                sx={{ color: 'text.secondary', mr: 1 }}
              />
              <Typography variant="body2">
                {format(parseISO(appointment.startTime), 'MMMM d, yyyy')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon
                fontSize="small"
                sx={{ color: 'text.secondary', mr: 1 }}
              />
              <Typography variant="body2">
                {format(parseISO(appointment.startTime), 'h:mm a')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Duration: {appointment.duration} minutes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Price: ${appointment.price}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  const filteredAppointments = appointments?.filter((appointment) => {
    const appointmentDate = parseISO(appointment.startTime)
    switch (tabValue) {
      case 0: // Upcoming
        return (
          isFuture(appointmentDate) && appointment.status !== 'cancelled'
        )
      case 1: // Past
        return (
          isPast(appointmentDate) || appointment.status === 'cancelled'
        )
      default:
        return true
    }
  })

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Appointments
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {appointmentsError ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
              >
                Error loading appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please try again later
              </Typography>
            </Box>
          ) : !appointments ? (
            <Grid container spacing={3}>
              {Array.from(new Array(3)).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredAppointments?.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No appointments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tabValue === 0
                        ? "You don't have any upcoming appointments"
                        : "You don't have any past appointments"}
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredAppointments?.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <AppointmentCard appointment={appointment} />
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {filteredAppointments?.map((appointment) => (
              <Grid item xs={12} key={appointment.id}>
                <AppointmentCard appointment={appointment} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep</Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CustomerAppointments
