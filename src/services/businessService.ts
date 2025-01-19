import { Business, CreateBusinessInput, UpdateBusinessInput, WorkingHours, NotificationSettings, PaymentSettings } from '@/types/business';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export const businessService = {
  getBusiness: async (id: string): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  getBusinessByUserId: async (userId: string): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  getBusinessProfile: async (businessId: string): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categories(*)')
      .eq('id', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  //getBusinessStats
  getBusinessStats: async (businessId: string) => {
    const { data, error } = await supabase
      .from('business_stats')
      .select('*')
      .eq('businessId', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateBusiness: async (id: string, input: UpdateBusinessInput): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
updateBusinessProfile: async (businessId: string, input: Partial<Business>): Promise<Business> => {
  const { data, error } = await supabase
    .from('businesses')
    .update(input)
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw error;
  return data;
},

  createBusiness: async (input: CreateBusinessInput): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .insert(input)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateBusinessCategory: async (businessId: string, categoryId: string): Promise<void> => {
    const { error } = await supabase
      .from('businesses')
      .update({ categoryId })
      .eq('id', businessId);
    
    if (error) throw error;
  },

  updateBusinessServices: async (businessId: string, services: any[]): Promise<void> => {
    const { error } = await supabase
      .from('services')
      .upsert(services.map(service => ({ ...service, businessId })));
    
    if (error) throw error;
  },


  updateBusinessImage: async (businessId: string, imageData: { logoUrl?: string; coverUrl?: string }): Promise<Business> => {
    const { data, error } = await supabase
      .from('businesses')
      .update(imageData)
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getBusinessServices: async (businessId: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('businessId', businessId);
    
    if (error) throw error;
    return data;
  },
  
  getBusinessStaff: async (businessId: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('businessId', businessId);
    
    if (error) throw error;
    return data;
  },

  getBusinessSettings: async (businessId: string) => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('businessId', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  getWorkingHours: async (businessId: string): Promise<WorkingHours> => {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('businessId', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateWorkingHours: async (businessId: string, workingHours: WorkingHours): Promise<void> => {
    const { error } = await supabase
      .from('working_hours')
      .upsert({ ...workingHours, businessId });
    
    if (error) throw error;
  },

  getNotificationSettings: async (businessId: string): Promise<NotificationSettings> => {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('businessId', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateNotificationSettings: async (businessId: string, settings: NotificationSettings): Promise<void> => {
    const { error } = await supabase
      .from('notification_settings')
      .upsert({ ...settings, businessId });
    
    if (error) throw error;
  },

  getPaymentSettings: async (businessId: string): Promise<PaymentSettings> => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('businessId', businessId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePaymentSettings: async (businessId: string, settings: PaymentSettings): Promise<void> => {
    const { error } = await supabase
      .from('payment_settings')
      .upsert({ ...settings, businessId });
    
    if (error) throw error;
  },

  searchBusinesses: async (query: string, filters?: any) => {
    let queryBuilder = supabase
      .from('businesses')
      .select('*')
      .textSearch('name', query);

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('categoryId', filters.category);
    }

    if (filters?.location) {
      // Add location-based filtering logic here
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};
