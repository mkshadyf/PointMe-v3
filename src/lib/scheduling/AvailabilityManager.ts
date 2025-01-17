import { supabase } from '../supabase'
import {
  addMinutes,
  format,
  parse,
  isWithinInterval,
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  isSameDay,
  getDay,
} from 'date-fns'

export interface TimeSlot {
  start: Date
  end: Date
}

export interface WorkingHours {
  dayOfWeek: number
  slots: TimeSlot[]
  breaks: TimeSlot[]
}

export interface BlockedTime {
  id: string
  businessId: string
  staffId: string
  startTime: Date
  endTime: Date
  reason: string
}

export class AvailabilityManager {
  async getWorkingHours(
    businessId: string,
    staffId?: string
  ): Promise<WorkingHours[]> {
    try {
      let query = supabase
        .from('working_hours')
        .select('*')
        .eq('businessId', businessId)

      if (staffId) {
        query = query.eq('staffId', staffId)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        slots: item.slots.map((slot: any) => ({
          start: parseISO(slot.start),
          end: parseISO(slot.end),
        })),
        breaks: item.breaks.map((breakSlot: any) => ({
          start: parseISO(breakSlot.start),
          end: parseISO(breakSlot.end),
        })),
      }))
    } catch (error) {
      console.error('Error fetching working hours:', error)
      throw error
    }
  }

  async getBlockedTimes(
    businessId: string,
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BlockedTime[]> {
    try {
      const { data, error } = await supabase
        .from('blocked_times')
        .select('*')
        .eq('businessId', businessId)
        .eq('staffId', staffId)
        .gte('startTime', startDate.toISOString())
        .lte('endTime', endDate.toISOString())

      if (error) throw error

      return data.map((item) => ({
        ...item,
        startTime: parseISO(item.startTime),
        endTime: parseISO(item.endTime),
      }))
    } catch (error) {
      console.error('Error fetching blocked times:', error)
      throw error
    }
  }

  async getAvailableSlots(
    businessId: string,
    staffId: string,
    date: Date,
    duration: number
  ): Promise<TimeSlot[]> {
    try {
      // Get working hours for the day
      const workingHours = await this.getWorkingHours(businessId, staffId)
      const dayOfWeek = getDay(date)
      const daySchedule = workingHours.find(
        (wh) => wh.dayOfWeek === dayOfWeek
      )

      if (!daySchedule || daySchedule.slots.length === 0) {
        return [] // Not working on this day
      }

      // Get blocked times for the day
      const blockedTimes = await this.getBlockedTimes(
        businessId,
        staffId,
        startOfDay(date),
        endOfDay(date)
      )

      // Get existing appointments
      const appointments = await this.getExistingAppointments(
        businessId,
        staffId,
        date
      )

      // Generate all possible slots
      const availableSlots: TimeSlot[] = []
      for (const slot of daySchedule.slots) {
        let currentStart = new Date(date)
        currentStart.setHours(slot.start.getHours())
        currentStart.setMinutes(slot.start.getMinutes())

        const slotEnd = new Date(date)
        slotEnd.setHours(slot.end.getHours())
        slotEnd.setMinutes(slot.end.getMinutes())

        while (addMinutes(currentStart, duration) <= slotEnd) {
          const potentialSlot = {
            start: currentStart,
            end: addMinutes(currentStart, duration),
          }

          // Check if slot conflicts with breaks
          const breakConflict = daySchedule.breaks.some((breakSlot) =>
            areIntervalsOverlapping(
              { start: breakSlot.start, end: breakSlot.end },
              potentialSlot
            )
          )

          // Check if slot conflicts with blocked times
          const blockConflict = blockedTimes.some((block) =>
            areIntervalsOverlapping(
              { start: block.startTime, end: block.endTime },
              potentialSlot
            )
          )

          // Check if slot conflicts with existing appointments
          const appointmentConflict = appointments.some((apt) =>
            areIntervalsOverlapping(
              { start: apt.startTime, end: apt.endTime },
              potentialSlot
            )
          )

          if (!breakConflict && !blockConflict && !appointmentConflict) {
            availableSlots.push({
              start: new Date(currentStart),
              end: addMinutes(currentStart, duration),
            })
          }

          currentStart = addMinutes(currentStart, 15) // 15-minute intervals
        }
      }

      return availableSlots
    } catch (error) {
      console.error('Error getting available slots:', error)
      throw error
    }
  }

  private async getExistingAppointments(
    businessId: string,
    staffId: string,
    date: Date
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('businessId', businessId)
        .eq('staffId', staffId)
        .gte('startTime', startOfDay(date).toISOString())
        .lte('endTime', endOfDay(date).toISOString())
        .in('status', ['confirmed', 'pending'])

      if (error) throw error

      return data.map((apt) => ({
        ...apt,
        startTime: parseISO(apt.startTime),
        endTime: parseISO(apt.endTime),
      }))
    } catch (error) {
      console.error('Error fetching existing appointments:', error)
      throw error
    }
  }

  async checkAvailability(
    businessId: string,
    staffId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      // Get working hours
      const workingHours = await this.getWorkingHours(businessId, staffId)
      const dayOfWeek = getDay(startTime)
      const daySchedule = workingHours.find(
        (wh) => wh.dayOfWeek === dayOfWeek
      )

      if (!daySchedule) return false // Not working on this day

      // Check if within working hours
      const withinWorkingHours = daySchedule.slots.some((slot) => {
        const slotStart = new Date(startTime)
        slotStart.setHours(slot.start.getHours())
        slotStart.setMinutes(slot.start.getMinutes())

        const slotEnd = new Date(startTime)
        slotEnd.setHours(slot.end.getHours())
        slotEnd.setMinutes(slot.end.getMinutes())

        return (
          startTime >= slotStart &&
          endTime <= slotEnd
        )
      })

      if (!withinWorkingHours) return false

      // Check breaks
      const breakConflict = daySchedule.breaks.some((breakSlot) => {
        const breakStart = new Date(startTime)
        breakStart.setHours(breakSlot.start.getHours())
        breakStart.setMinutes(breakSlot.start.getMinutes())

        const breakEnd = new Date(startTime)
        breakEnd.setHours(breakSlot.end.getHours())
        breakEnd.setMinutes(breakSlot.end.getMinutes())

        return areIntervalsOverlapping(
          { start: breakStart, end: breakEnd },
          { start: startTime, end: endTime }
        )
      })

      if (breakConflict) return false

      // Check blocked times
      const blockedTimes = await this.getBlockedTimes(
        businessId,
        staffId,
        startOfDay(startTime),
        endOfDay(startTime)
      )

      const blockConflict = blockedTimes.some((block) =>
        areIntervalsOverlapping(
          { start: block.startTime, end: block.endTime },
          { start: startTime, end: endTime }
        )
      )

      if (blockConflict) return false

      // Check existing appointments
      const appointments = await this.getExistingAppointments(
        businessId,
        staffId,
        startTime
      )

      const appointmentConflict = appointments.some((apt) =>
        areIntervalsOverlapping(
          { start: apt.startTime, end: apt.endTime },
          { start: startTime, end: endTime }
        )
      )

      return !appointmentConflict
    } catch (error) {
      console.error('Error checking availability:', error)
      throw error
    }
  }

  async blockTimeSlot(
    businessId: string,
    staffId: string,
    startTime: Date,
    endTime: Date,
    reason: string = 'Appointment'
  ): Promise<void> {
    try {
      const { error } = await supabase.from('blocked_times').insert([
        {
          businessId,
          staffId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error('Error blocking time slot:', error)
      throw error
    }
  }

  async freeTimeSlot(
    businessId: string,
    staffId: string,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('businessId', businessId)
        .eq('staffId', staffId)
        .eq('startTime', startTime.toISOString())
        .eq('endTime', endTime.toISOString())

      if (error) throw error
    } catch (error) {
      console.error('Error freeing time slot:', error)
      throw error
    }
  }

  async updateWorkingHours(
    businessId: string,
    staffId: string,
    workingHours: WorkingHours[]
  ): Promise<void> {
    try {
      // First, delete existing working hours
      const { error: deleteError } = await supabase
        .from('working_hours')
        .delete()
        .eq('businessId', businessId)
        .eq('staffId', staffId)

      if (deleteError) throw deleteError

      // Then, insert new working hours
      const { error: insertError } = await supabase
        .from('working_hours')
        .insert(
          workingHours.map((wh) => ({
            businessId,
            staffId,
            dayOfWeek: wh.dayOfWeek,
            slots: wh.slots.map((slot) => ({
              start: format(slot.start, 'HH:mm'),
              end: format(slot.end, 'HH:mm'),
            })),
            breaks: wh.breaks.map((breakSlot) => ({
              start: format(breakSlot.start, 'HH:mm'),
              end: format(breakSlot.end, 'HH:mm'),
            })),
          }))
        )

      if (insertError) throw insertError
    } catch (error) {
      console.error('Error updating working hours:', error)
      throw error
    }
  }
}

export const availabilityManager = new AvailabilityManager()
