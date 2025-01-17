import { supabase } from '../lib/supabase'
import { Business, CreateBusinessInput, UpdateBusinessInput } from '../types/business'

const businessService = {
  async getBusinesses(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async getBusinessById(id: string): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    return data
  },

  async createBusiness(input: CreateBusinessInput, ownerId: string): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        ...input,
        owner_id: ownerId
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBusiness(id: string, input: UpdateBusinessInput): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBusiness(id: string): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getWorkingHours(businessId: string): Promise<Business['workingHours']> {
    const { data, error } = await supabase
      .from('businesses')
      .select('working_hours')
      .eq('id', businessId)
      .single()

    if (error) throw error
    return data.working_hours
  },

  async updateWorkingHours(businessId: string, workingHours: Business['workingHours']): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({ working_hours: workingHours })
      .eq('id', businessId)

    if (error) throw error
  },

  async getPaymentSettings(businessId: string): Promise<Business['paymentSettings']> {
    const { data, error } = await supabase
      .from('businesses')
      .select('payment_settings')
      .eq('id', businessId)
      .single()

    if (error) throw error
    return data.payment_settings
  },

  async updatePaymentSettings(businessId: string, settings: Business['paymentSettings']): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({ payment_settings: settings })
      .eq('id', businessId)

    if (error) throw error
  },

  async getNotificationSettings(businessId: string): Promise<Business['notificationSettings']> {
    const { data, error } = await supabase
      .from('businesses')
      .select('notification_settings')
      .eq('id', businessId)
      .single()

    if (error) throw error
    return data.notification_settings
  },

  async updateNotificationSettings(businessId: string, settings: Business['notificationSettings']): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({ notification_settings: settings })
      .eq('id', businessId)

    if (error) throw error
  },

  async searchBusinesses(query: string, filters?: { category?: string }): Promise<Business[]> {
    let queryBuilder = supabase
      .from('businesses')
      .select('*')
      .ilike('name', `%${query}%`);

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('business_categories')
      .select('name')
      .order('name');

    if (error) throw error;
    return data.map(category => category.name);
  }
}

export default businessService
