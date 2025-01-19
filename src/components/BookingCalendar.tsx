import React from 'react'
import useSWR, { mutate } from 'swr'
import { createTrpcFetcher, createTrpcKey, createTrpcMutation } from '@/utils/swr-helpers'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Box, Typography } from '@mui/material'

interface BookingCalendarProps {
  businessId: string
}

interface CreateBookingInput {
  // Add properties for CreateBookingInput
}

interface BookingSlot {
  // Add properties for BookingSlot
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ businessId }) => {
  const { data: existingBookings, error: bookingsError } = useSWR(
    createTrpcKey(['business', 'bookings', 'getBusinessBookings'], businessId),
    createTrpcFetcher(['business', 'bookings', 'getBusinessBookings'], businessId)
  )

  const events = existingBookings?.map(booking => ({
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
