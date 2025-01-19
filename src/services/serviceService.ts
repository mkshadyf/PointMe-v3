import { createClient } from '@/lib/supabase'
import { Service, Category } from '@/types/business'

const supabase = createClient()

export interface CreateServiceInput {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  maxParticipants?: number;
  isActive?: boolean;
  requiresConfirmation: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  maxParticipants?: number;
  isActive?: boolean;
  requiresConfirmation?: boolean;
}

const serviceService = {
  async getServices(businessId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('businessId', businessId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getServiceById(id: string): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getServiceCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createService(businessId: string, input: CreateServiceInput): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({ ...input, businessId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateService(id: string, input: UpdateServiceInput): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadServiceImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `service-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;

    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    if (urlError) throw urlError;

    return publicUrl;
  },

  async deleteServiceImage(imageUrl: string): Promise<void> {
    const filePath = imageUrl.split('/').pop();
    if (!filePath) return;

    const { error } = await supabase.storage
      .from('public')
      .remove([filePath]);
    
    if (error) throw error;
  },
};

export default serviceService;
