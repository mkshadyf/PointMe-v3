import { supabase } from '../lib/supabase';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters,
} from '../types/appointment';

const appointmentService = {
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*, business:businesses(*), service:services(*)');

    if (filters) {
      if (filters.businessId) {
        query = query.eq('businessId', filters.businessId);
      }
      if (filters.customerId) {
        query = query.eq('customerId', filters.customerId);
      }
      if (filters.staffId) {
        query = query.eq('staffId', filters.staffId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.paymentStatus) {
        query = query.eq('paymentStatus', filters.paymentStatus);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }
    }

    const { data, error } = await query.order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, business:businesses(*), service:services(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    // First check if the slot is available
    const isAvailable = await this.checkAvailability(
      input.businessId,
      input.serviceId,
      input.staffId,
      input.date,
      input.startTime
    );

    if (!isAvailable) {
      throw new Error('This time slot is not available');
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert(input)
      .select('*, business:businesses(*), service:services(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(
    id: string,
    input: UpdateAppointmentInput
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(input)
      .eq('id', id)
      .select('*, business:businesses(*), service:services(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },

  async checkAvailability(
    businessId: string,
    serviceId: string,
    staffId: string | undefined,
    date: Date,
    startTime: string
  ): Promise<boolean> {
    // Get the service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();
    if (serviceError) throw serviceError;

    // Check for conflicting appointments
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('*')
      .eq('businessId', businessId)
      .eq('date', date.toISOString().split('T')[0])
      .or(`staffId.eq.${staffId},and(staffId.is.null)`)
      .not('status', 'in', '("cancelled","no-show")')
      .overlaps('startTime', this.calculateEndTime(startTime, service.duration));

    if (conflictError) throw conflictError;
    return conflicts.length === 0;
  },

  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes
      .toString()
      .padStart(2, '0')}`;
  },
};

export default appointmentService;
