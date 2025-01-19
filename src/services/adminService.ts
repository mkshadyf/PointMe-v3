import { supabase } from '../lib/supabase'
import { Business } from '../types/business'
import { AdminStats, Report } from '../types/admin'

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  parentId?: string;
  isActive: boolean;
}

const adminService = {
  // Dashboard Stats
  async getAdminStats(): Promise<AdminStats> {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) throw error;
    return data;
  },

  // Business Management
  async getPendingBusinesses(): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'pending');
    if (error) throw error;
    return data;
  },

  async approveBusinesses(businessId: string): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({ status: 'approved' })
      .eq('id', businessId);
    if (error) throw error;
  },

  async rejectBusiness(businessId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('businesses')
      .update({ status: 'rejected', rejectionReason: reason })
      .eq('id', businessId);
    if (error) throw error;
  },

  // Category Management
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order');
    if (error) throw error;
    return data;
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateCategoriesOrder(categories: { id: string; order: number }[]): Promise<void> {
    const { error } = await supabase.rpc('update_categories_order', { categories });
    if (error) throw error;
  },

  // Content Moderation
  async getContentReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  },

  async resolveReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'resolved', updatedAt: new Date().toISOString() })
      .eq('id', reportId);
    if (error) throw error;
  },

  async dismissReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'dismissed', updatedAt: new Date().toISOString() })
      .eq('id', reportId);
    if (error) throw error;
  },

  // User Management
  async suspendUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', userId);
    if (error) throw error;
  },

  async activateUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', userId);
    if (error) throw error;
  }
}

export { adminService }
