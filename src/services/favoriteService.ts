import { supabase } from '../lib/supabase';
import { Business } from '../types/business';

class FavoriteService {
  async getFavorites(userId: string): Promise<Business[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('business_id, businesses(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.businesses);
  }

  async addFavorite(userId: string, businessId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, business_id: businessId });

    if (error) throw error;
  }

  async removeFavorite(userId: string, businessId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, business_id: businessId });

    if (error) throw error;
  }

  async isFavorite(userId: string, businessId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .match({ user_id: userId, business_id: businessId })
      .single();

    if (error && error.code !== 'PGRST116') return false;
    return !!data;
  }
}

export default new FavoriteService();
