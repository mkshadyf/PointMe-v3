import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Badge,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import appointmentService from '../../services/appointmentService'
import serviceService from '../../services/serviceService'
import staffService from '../../services/staffService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import {
  format,
  parseISO,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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

const AppointmentScheduling: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [tabValue, setTabValue] = React.useState(0)
  const calendarRef = React.useRef<any>(null)

  const { data: appointments, isLoading: appointmentsLoading } = useQuery(
    ['appointments', user?.id, format(selectedDate, 'yyyy-MM-dd')],
    () =>
      appointmentService.getBusinessAppointments(
        user!.id,
        format(selectedDate, 'yyyy-MM-dd')
      )
  )

  const { data: services } = useQuery(['services', user?.id], () =>
    serviceService.getBusinessServices(user!.id)
  )

  const { data: staff } = useQuery(['staff', user?.id], () =>
    staffService.getBusinessStaff(user!.id)
  )

  const updateAppointmentMutation = useMutation(
    (data: any) => appointmentService.updateAppointment(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['appointments', user?.id])
        showNotification('Appointment updated successfully', 'success')
        setIsDialogOpen(false)
      },
      onError: () => {
        showNotification('Failed to update appointment', 'error')
      },
    }
  )

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEventClick = (info: any) => {
    setSelectedAppointment(info.event.extendedProps)
    setIsDialogOpen(true)
  }

  const handleStatusChange = (appointmentId: string, status: string) => {
    updateAppointmentMutation.mutate({
      id: appointmentId,
      status,
    })
  }

  const getAppointmentColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#4caf50'
      case 'pending':
        return '#ff9800'
      case 'cancelled':
        return '#f44336'
      default:
        return '#2196f3'
    }
  }

  const WeekView = () => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={12} sm={6} md={3} key={day.toString()}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: isToday(day) ? 'primary.light' : 'inherit',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textAlign: 'center' }}
                >
                  {format(day, 'EEE, MMM d')}
                </Typography>
                {appointments
                  ?.filter((apt) => isSameDay(parseISO(apt.startTime), day))
                  .map((appointment) => (
                    <Box
                      key={appointment.id}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: getAppointmentColor(appointment.status),
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Typography variant="subtitle2">
                        {format(parseISO(appointment.startTime), 'h:mm a')}
                      </Typography>
                      <Typography variant="body2">
                        {appointment.customerName}
                      </Typography>
                      <Typography variant="caption">
                        {appointment.serviceName}
                      </Typography>
                    </Box>
                  ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const CalendarView = () => (
    <Box sx={{ height: 'calc(100vh - 300px)' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={appointments?.map((apt) => ({
          id: apt.id,
          title: `${apt.customerName} - ${apt.serviceName}`,
          start: apt.startTime,
          end: apt.endTime,
          backgroundColor: getAppointmentColor(apt.status),
          extendedProps: apt,
        }))}
        eventClick={handleEventClick}
        height="100%"
      />
    </Box>
  )

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please sign in to manage appointments
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Appointment Management
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Calendar View" />
            <Tab label="Week View" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <CalendarView />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Button
                  onClick={() =>
                    handleDateChange(subWeeks(selectedDate, 1))
                  }
                >
                  Previous Week
                </Button>
                <Typography variant="h6">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Typography>
                <Button
                  onClick={() =>
                    handleDateChange(addWeeks(selectedDate, 1))
                  }
                >
                  Next Week
                </Button>
              </Box>
              <WeekView />
            </TabPanel>
          </Box>
        </Paper>

        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {selectedAppointment.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAppointment.customerEmail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAppointment.customerPhone}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Service Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {selectedAppointment.serviceName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {selectedAppointment.duration} minutes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ${selectedAppointment.price}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Schedule
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {format(
                        parseISO(selectedAppointment.startTime),
                        'MMMM d, yyyy'
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(
                        parseISO(selectedAppointment.startTime),
                        'h:mm a'
                      )}{' '}
                      -{' '}
                      {format(
                        parseISO(selectedAppointment.endTime),
                        'h:mm a'
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Status
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Button
                      variant={
                        selectedAppointment.status === 'confirmed'
                          ? 'contained'
                          : 'outlined'
                      }
                      color="success"
                      onClick={() =>
                        handleStatusChange(
                          selectedAppointment.id,
                          'confirmed'
                        )
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      variant={
                        selectedAppointment.status === 'cancelled'
                          ? 'contained'
                          : 'outlined'
                      }
                      color="error"
                      onClick={() =>
                        handleStatusChange(
                          selectedAppointment.id,
                          'cancelled'
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default AppointmentScheduling

