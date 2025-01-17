import { supabase } from '../lib/supabase'
import {
  BusinessCategory,
  ServiceCategory,
  CreateBusinessCategoryInput,
  UpdateBusinessCategoryInput,
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from '../types/category'

const categoryService = {
  // Business Categories
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async getBusinessCategory(id: string): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createBusinessCategory(input: CreateBusinessCategoryInput): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBusinessCategory(id: string, input: UpdateBusinessCategoryInput): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteBusinessCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Service Categories
  async getServiceCategories(businessCategoryId?: string): Promise<ServiceCategory[]> {
    let query = supabase
      .from('service_categories')
      .select('*')
      .order('name')

    if (businessCategoryId) {
      query = query.eq('business_category_id', businessCategoryId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getServiceCategory(id: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createServiceCategory(input: CreateServiceCategoryInput): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .insert([{
        ...input,
        business_category_id: input.businessCategoryId
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateServiceCategory(id: string, input: UpdateServiceCategoryInput): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .update({
        ...input,
        business_category_id: input.businessCategoryId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteServiceCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export default categoryService
