import React, { useState, useRef } from 'react'
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
import useSWR from 'swr'
import { appointmentService } from '@/services/appointmentService'
import { serviceService } from '@/services/serviceService'
import { staffService } from '@/services/staffService'
import { useAuthStore } from '@/stores/authStore'
import { useNotification } from '@/contexts/NotificationContext'
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
import { Appointment, AppointmentStatus, CreateAppointmentInput, UpdateAppointmentInput } from '@/types/appointment'
import { Service } from '@/types/business'
import { Staff } from '@/types/business'
import { EventClickArg } from '@fullcalendar/core'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const appointmentSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  staffId: z.string().min(1, 'Staff member is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(1, 'Phone number is required'),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

export default function AppointmentScheduling() {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const calendarRef = useRef<FullCalendar>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const { data: appointments, error: appointmentsError, mutate: mutateAppointments } = useSWR<Appointment[]>(
    user?.id ? ['appointments', user.id, format(selectedDate, 'yyyy-MM-dd')] : null,
    () => appointmentService.getBusinessAppointments(user.id!, format(selectedDate, 'yyyy-MM-dd'))
  )

  const { data: services, error: servicesError } = useSWR<Service[]>(
    user?.id ? ['services', user.id] : null,
    () => serviceService.getBusinessServices(user.id!)
  )

  const { data: staff, error: staffError } = useSWR<Staff[]>(
    user?.id ? ['staff', user.id] : null,
    () => staffService.getBusinessStaff(user.id!)
  )

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      await appointmentService.createAppointment({
        ...data,
        businessId: user.id,
        status: AppointmentStatus.PENDING,
      })
      await mutateAppointments()
      setIsDialogOpen(false)
      reset()
      showNotification('Appointment created successfully', 'success')
    } catch (error) {
      console.error('Failed to create appointment:', error)
      showNotification('Failed to create appointment', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEventClick = (info: EventClickArg) => {
    setSelectedAppointment(info.event.extendedProps as Appointment)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      setIsLoading(true)
      await appointmentService.updateAppointment(appointmentId, { status })
      await mutateAppointments()
      showNotification('Appointment updated successfully', 'success')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to update appointment:', error)
      showNotification('Failed to update appointment', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const getAppointmentColor = (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return '#4caf50'
      case AppointmentStatus.PENDING:
        return '#ff9800'
      case AppointmentStatus.CANCELLED:
        return '#f44336'
      case AppointmentStatus.COMPLETED:
        return '#2196f3'
      case AppointmentStatus.NO_SHOW:
        return '#9c27b0'
      case AppointmentStatus.REJECTED:
        return '#d32f2f'
      case AppointmentStatus.PAID:
        return '#009688'
      default:
        return '#2196f3'
    }
  }

  if (!user) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Please log in to view appointments
      </Alert>
    )
  }

  if (appointmentsError || servicesError || staffError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load appointments. Please try again later.
      </Alert>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Appointments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              reset()
              setSelectedAppointment(null)
              setIsDialogOpen(true)
            }}
          >
            New Appointment
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Calendar" />
            <Tab label="Week View" />
            <Tab label="List View" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 600 }}>
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
                  title: `${apt.customerName} - ${apt.service.name}`,
                  start: apt.startTime,
                  end: apt.endTime,
                  backgroundColor: getAppointmentColor(apt.status),
                  extendedProps: apt,
                }))}
                eventClick={handleEventClick}
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                nowIndicator={true}
                height="100%"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <WeekView />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ListView />
          </TabPanel>
        </Paper>

        <AppointmentDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          appointment={selectedAppointment}
          onStatusChange={handleStatusChange}
          onSubmit={handleCreateAppointment}
          services={services || []}
          staff={staff || []}
          control={control}
          errors={errors}
          isLoading={isLoading}
          isDirty={isDirty}
        />
      </Box>
    </Container>
  )
}

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<void>;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  services: Service[];
  staff: Staff[];
  control: any;
  errors: any;
  isLoading: boolean;
  isDirty: boolean;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  onClose,
  appointment,
  onStatusChange,
  onSubmit,
  services,
  staff,
  control,
  errors,
  isLoading,
  isDirty,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {appointment ? 'View Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Form fields */}
              <Grid item xs={12}>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.serviceId}>
                      <InputLabel>Service</InputLabel>
                      <Select {...field} label="Service">
                        {services.map((service) => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="staffId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.staffId}>
                      <InputLabel>Staff Member</InputLabel>
                      <Select {...field} label="Staff Member">
                        {staff.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            {member.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Start Time"
                      fullWidth
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="End Time"
                      fullWidth
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer Email"
                      fullWidth
                      error={!!errors.customerEmail}
                      helperText={errors.customerEmail?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer Phone"
                      fullWidth
                      error={!!errors.customerPhone}
                      helperText={errors.customerPhone?.message}
                    />
                  )}
                />
              </Grid>

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
                      rows={4}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {appointment ? (
            <>
              <LoadingButton
                onClick={() =>
                  onStatusChange(appointment.id, AppointmentStatus.CONFIRMED)
                }
                loading={isLoading}
                color="primary"
                startIcon={<CheckIcon />}
              >
                Confirm
              </LoadingButton>
              <LoadingButton
                onClick={() =>
                  onStatusChange(appointment.id, AppointmentStatus.REJECTED)
                }
                loading={isLoading}
                color="error"
                startIcon={<CloseIcon />}
              >
                Reject
              </LoadingButton>
            </>
          ) : (
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={!isDirty}
              variant="contained"
            >
              Create
            </LoadingButton>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}

const WeekView: React.FC = () => {
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
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
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                {format(day, 'EEE, MMM d')}
              </Typography>
              {/* Appointments for this day will be rendered here */}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

const ListView: React.FC = () => {
  return (
    <Box>
      {/* List view implementation */}
    </Box>
  )
}
