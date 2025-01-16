import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Box, Typography } from '@mui/material'
import { trpc } from '../utils/trpc'

const BookingCalendar: React.FC = () => {
  const userBookingsQuery = trpc.business.getUserBookings.useQuery()

  const events = userBookingsQuery.data?.map(booking => ({
    id: booking.id,
    title: booking.service.name,
    start: booking.startTime,
    end: booking.endTime,
  })) || []

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Booking Calendar
      </Typography>
      <Box sx={{ height: 600 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventContent={(eventInfo) => (
            <>
              <b>{eventInfo.timeText}</b>
              <i>{eventInfo.event.title}</i>
            </>
          )}
        />
      </Box>
    </Box>
  )
}

export default BookingCalendar

