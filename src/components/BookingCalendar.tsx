import React, { useState } from 'react'
import { trpc } from '../utils/trpc'
import { Booking, CreateBookingInput } from '../types'
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Event as CalendarEvent
} from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  serviceId: string
  onBookingSelect?: (booking: Booking) => void
  onSlotSelect?: (slotInfo: SlotInfo) => void
  editable?: boolean
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  serviceId,
  onBookingSelect,
  onSlotSelect,
  editable = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  const { data: bookings } = trpc.booking.list.useQuery({ serviceId })
  const createMutation = trpc.booking.create.useMutation()
  const updateMutation = trpc.booking.update.useMutation()
  const cancelMutation = trpc.booking.cancel.useMutation()

  const events: CalendarEvent[] = bookings?.map((booking: { id: any; user: { name: any }; startTime: string | number | Date; endTime: string | number | Date }) => ({
    id: booking.id,
    title: `Booking: ${booking.user.name}`,
    start: new Date(booking.startTime),
    end: new Date(booking.endTime),
    resource: booking
  })) || []

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (editable && onSlotSelect) {
      onSlotSelect(slotInfo)
    }
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onBookingSelect && event.resource) {
      onBookingSelect(event.resource as Booking)
    }
  }

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={editable}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        defaultView="week"
        views={['week', 'day']}
        min={moment().set('hour', 8).toDate()}
        max={moment().set('hour', 20).toDate()}
      />
    </div>
  )
}

export default BookingCalendar
