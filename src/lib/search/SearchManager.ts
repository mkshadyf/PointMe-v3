import { supabase } from '../supabase'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export interface SearchFilters {
  category?: string
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
  priceRange?: {
    min?: number
    max?: number
  }
  rating?: number
  availability?: {
    date: Date
    timeSlot?: {
      start: string // HH:mm format
      end: string // HH:mm format
    }
  }
  services?: string[]
  tags?: string[]
}

export interface SearchOptions {
  page?: number
  limit?: number
  sortBy?: 'rating' | 'distance' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  businesses: any[]
  total: number
}

export class SearchManager {
  async searchBusinesses(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc',
      } = options

      let queryBuilder = supabase
        .from('businesses')
        .select('*, categories(*), services(*)', { count: 'exact' })

      // Apply text search if query is provided
      if (query) {
        queryBuilder = queryBuilder.textSearch('searchable', query, {
          type: 'websearch',
          config: 'english',
        })
      }

      // Apply filters
      queryBuilder = this.applyFilters(queryBuilder, filters)

      // Apply sorting
      queryBuilder = this.applySorting(queryBuilder, sortBy, sortOrder, filters)

      // Apply pagination
      const { data, count, error } = await queryBuilder.range(
        (page - 1) * limit,
        page * limit - 1
      )

      if (error) throw error

      // Calculate distances if location filter is applied
      let results = data
      if (filters.location) {
        results = this.calculateDistances(
          data,
          filters.location.latitude,
          filters.location.longitude
        )
      }

      return {
        businesses: results,
        total: count || 0,
      }
    } catch (error) {
      console.error('Error searching businesses:', error)
      throw error
    }
  }

  private applyFilters(
    queryBuilder: PostgrestFilterBuilder<any, any, any>,
    filters: SearchFilters
  ): PostgrestFilterBuilder<any, any, any> {
    const {
      category,
      priceRange,
      rating,
      availability,
      services,
      tags,
    } = filters

    if (category) {
      queryBuilder = queryBuilder.eq('categoryId', category)
    }

    if (priceRange) {
      if (priceRange.min !== undefined) {
        queryBuilder = queryBuilder.gte('price', priceRange.min)
      }
      if (priceRange.max !== undefined) {
        queryBuilder = queryBuilder.lte('price', priceRange.max)
      }
    }

    if (rating) {
      queryBuilder = queryBuilder.gte('averageRating', rating)
    }

    if (services?.length) {
      queryBuilder = queryBuilder.contains('services', services)
    }

    if (tags?.length) {
      queryBuilder = queryBuilder.contains('tags', tags)
    }

    if (availability) {
      // Add availability filter logic based on working hours and appointments
      // This would typically involve a more complex query or additional checks
    }

    return queryBuilder
  }

  private applySorting(
    queryBuilder: PostgrestFilterBuilder<any, any, any>,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    filters: SearchFilters
  ): PostgrestFilterBuilder<any, any, any> {
    switch (sortBy) {
      case 'rating':
        return queryBuilder.order('averageRating', {
          ascending: sortOrder === 'asc',
        })
      case 'price':
        return queryBuilder.order('price', {
          ascending: sortOrder === 'asc',
        })
      case 'distance':
        if (!filters.location) {
          console.warn('Distance sorting requires location filter')
          return queryBuilder
        }
        // Distance sorting will be handled after fetching results
        return queryBuilder
      default:
        return queryBuilder
    }
  }

  private calculateDistances(
    businesses: any[],
    latitude: number,
    longitude: number
  ): any[] {
    return businesses.map((business) => ({
      ...business,
      distance: this.calculateDistance(
        latitude,
        longitude,
        business.latitude,
        business.longitude
      ),
    }))
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers

    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  async getPopularSearches(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(10)

      if (error) throw error

      return data.map((item) => item.query)
    } catch (error) {
      console.error('Error fetching popular searches:', error)
      throw error
    }
  }

  async recordSearch(query: string): Promise<void> {
    try {
      await supabase.rpc('increment_search_count', {
        search_query: query.toLowerCase().trim(),
      })
    } catch (error) {
      console.error('Error recording search:', error)
      // Don't throw error to prevent blocking the search operation
    }
  }

  async getSearchSuggestions(
    query: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query')
        .ilike('query', `${query}%`)
        .order('count', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map((item) => item.query)
    } catch (error) {
      console.error('Error fetching search suggestions:', error)
      throw error
    }
  }
}

export const searchManager = new SearchManager()
