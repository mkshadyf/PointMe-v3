import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Skeleton,
  IconButton,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material'
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Appointment } from '../../types/appointment'
import AppointmentDetailsDialog from './AppointmentDetailsDialog'

interface AppointmentCalendarProps {
  appointments: Appointment[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  isLoading: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  selectedDate,
  onDateChange,
  isLoading,
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const weekStart = startOfWeek(selectedDate)

  const handlePreviousWeek = () => {
    onDateChange(addDays(weekStart, -7))
  }

  const handleNextWeek = () => {
    onDateChange(addDays(weekStart, 7))
  }

  const getAppointmentsForDateAndHour = (date: Date, hour: number) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.startTime)
      return (
        isSameDay(appointmentDate, date) &&
        appointmentDate.getHours() === hour
      )
    })
  }

  const renderTimeSlot = (date: Date, hour: number) => {
    const timeSlotAppointments = getAppointmentsForDateAndHour(date, hour)

    if (timeSlotAppointments.length === 0) {
      return null
    }

    return timeSlotAppointments.map((appointment) => (
      <Chip
        key={appointment.id}
        label={`${appointment.service?.name || 'Unnamed Service'} - ${appointment.customerId}`}
        size="small"
        color={appointment.status === 'confirmed' ? 'primary' : 'default'}
        onClick={() => setSelectedAppointment(appointment)}
        sx={{
          width: '100%',
          mb: 0.5,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      />
    ))
  }

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={600} />
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <IconButton onClick={handlePreviousWeek}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="h6">
            {format(weekStart, 'MMMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <NavigateNextIcon />
          </IconButton>
        </Box>

        <Grid container sx={{ minWidth: 800 }}>
          {/* Header row with days */}
          <Grid item xs={1}>
            <Box
              sx={{
                height: 50,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subtitle2">Time</Typography>
            </Box>
          </Grid>
          {DAYS_OF_WEEK.map((day, index) => {
            const currentDate = addDays(weekStart, index)
            const isCurrentDay = isToday(currentDate)
            const isSelected = isSameDay(currentDate, selectedDate)

            return (
              <Grid item xs key={day}>
                <Box
                  sx={{
                    height: 50,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: isSelected
                      ? 'primary.light'
                      : isCurrentDay
                      ? 'action.selected'
                      : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => onDateChange(currentDate)}
                >
                  <Typography
                    variant="subtitle2"
                    color={isSelected ? 'primary.main' : 'text.primary'}
                  >
                    {day}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={isSelected ? 'primary.main' : 'text.secondary'}
                  >
                    {format(currentDate, 'd')}
                  </Typography>
                </Box>
              </Grid>
            )
          })}

          {/* Time slots */}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <Grid item xs={1}>
                <Box
                  sx={{
                    height: 100,
                    borderBottom: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption">
                    {format(new Date().setHours(hour), 'ha')}
                  </Typography>
                </Box>
              </Grid>
              {DAYS_OF_WEEK.map((_, dayIndex) => {
                const currentDate = addDays(weekStart, dayIndex)
                return (
                  <Grid item xs key={`${hour}-${dayIndex}`}>
                    <Box
                      sx={{
                        height: 100,
                        borderBottom: 1,
                        borderRight: 1,
                        borderColor: 'divider',
                        p: 1,
                      }}
                    >
                      {renderTimeSlot(currentDate, hour)}
                    </Box>
                  </Grid>
                )
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </>
  )
}

export default AppointmentCalendar
