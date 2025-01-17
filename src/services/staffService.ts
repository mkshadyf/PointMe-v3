import { supabase } from '../lib/supabase';

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  services: string[];
  isActive: boolean;
  workingHours: StaffWorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffWorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  start?: string;
  end?: string;
  breaks?: Break[];
}

export interface Break {
  start: string;
  end: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  role: string;
  services: string[];
  workingHours: StaffWorkingHours;
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  services?: string[];
  isActive?: boolean;
  workingHours?: Partial<StaffWorkingHours>;
}

const staffService = {
  async getStaffMembers(businessId: string): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('businessId', businessId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async getStaffMemberById(id: string): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createStaffMember(
    businessId: string,
    input: CreateStaffInput
  ): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff')
      .insert({ ...input, businessId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStaffMember(
    id: string,
    input: UpdateStaffInput
  ): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStaffMember(id: string): Promise<void> {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw error;
  },

  async getAvailableStaff(
    businessId: string,
    serviceId: string,
    date: Date,
    startTime: string
  ): Promise<StaffMember[]> {
    // Get all staff members who can provide the service
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('businessId', businessId)
      .contains('services', [serviceId])
      .eq('isActive', true);

    if (staffError) throw staffError;

    // Get the service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();
    if (serviceError) throw serviceError;

    // Filter out staff with conflicting appointments
    const availableStaff = [];
    for (const staff of staffMembers) {
      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('*')
        .eq('staffId', staff.id)
        .eq('date', date.toISOString().split('T')[0])
        .not('status', 'in', '("cancelled","no-show")')
        .overlaps('startTime', this.calculateEndTime(startTime, service.duration));

      if (conflictError) throw conflictError;

      if (conflicts.length === 0 && this.isWithinWorkingHours(staff, date, startTime)) {
        availableStaff.push(staff);
      }
    }

    return availableStaff;
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

  isWithinWorkingHours(
    staff: StaffMember,
    date: Date,
    startTime: string
  ): boolean {
    const dayOfWeek = date.toLocaleLowerCase() as keyof StaffWorkingHours;
    const schedule = staff.workingHours[dayOfWeek];

    if (!schedule.isWorking || !schedule.start || !schedule.end) {
      return false;
    }

    return (
      startTime >= schedule.start &&
      startTime <= schedule.end &&
      !this.isWithinBreak(schedule.breaks, startTime)
    );
  },

  isWithinBreak(breaks: Break[] | undefined, time: string): boolean {
    if (!breaks) return false;

    return breaks.some(
      (breakTime) => time >= breakTime.start && time <= breakTime.end
    );
  },
};

export default staffService;
