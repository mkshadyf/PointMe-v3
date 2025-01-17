import { supabase } from '../supabase'
import { notificationManager } from '../notifications/NotificationManager'
import { NotificationType } from '../notifications/NotificationManager'

export interface Review {
  id: string
  businessId: string
  customerId: string
  appointmentId: string
  rating: number
  comment: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export class ReviewManager {
  async createReview(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([
          {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Update business average rating
      await this.updateBusinessRating(data.businessId)

      // Notify business about new review
      await notificationManager.createNotification({
        type: NotificationType.FEEDBACK_REQUEST,
        userId: data.businessId,
        title: 'New Review',
        message: `A customer has left a ${data.rating}-star review`,
        channels: ['in_app'],
        metadata: { reviewId: review.id },
        read: false,
      })

      return review
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  async updateReview(
    reviewId: string,
    data: Partial<Omit<Review, 'id' | 'businessId' | 'customerId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Review> {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error

      // Update business average rating if rating changed
      if (data.rating) {
        await this.updateBusinessRating(review.businessId)
      }

      return review
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { data: review } = await supabase
        .from('reviews')
        .select('businessId')
        .eq('id', reviewId)
        .single()

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      // Update business average rating
      if (review) {
        await this.updateBusinessRating(review.businessId)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  async getBusinessReviews(
    businessId: string,
    options: {
      page?: number
      limit?: number
      sortBy?: 'rating' | 'createdAt'
      sortOrder?: 'asc' | 'desc'
      minRating?: number
      maxRating?: number
    } = {}
  ): Promise<{ reviews: Review[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minRating,
        maxRating,
      } = options

      let query = supabase
        .from('reviews')
        .select('*, customers(name, avatar)', { count: 'exact' })
        .eq('businessId', businessId)

      if (minRating !== undefined) {
        query = query.gte('rating', minRating)
      }

      if (maxRating !== undefined) {
        query = query.lte('rating', maxRating)
      }

      const { data, count, error } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        reviews: data,
        total: count || 0,
      }
    } catch (error) {
      console.error('Error fetching business reviews:', error)
      throw error
    }
  }

  async getCustomerReviews(
    customerId: string,
    options: {
      page?: number
      limit?: number
      sortBy?: 'rating' | 'createdAt'
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<{ reviews: Review[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options

      const { data, count, error } = await supabase
        .from('reviews')
        .select('*, businesses(name, avatar)', { count: 'exact' })
        .eq('customerId', customerId)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        reviews: data,
        total: count || 0,
      }
    } catch (error) {
      console.error('Error fetching customer reviews:', error)
      throw error
    }
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('businessId', businessId)

      if (error) throw error

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = data.length > 0 ? totalRating / data.length : 0
      const totalReviews = data.length

      await supabase
        .from('businesses')
        .update({
          averageRating,
          totalReviews,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', businessId)
    } catch (error) {
      console.error('Error updating business rating:', error)
      throw error
    }
  }

  async getBusinessRatingStats(businessId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('businessId', businessId)

      if (error) throw error

      const ratingDistribution = data.reduce(
        (acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1
          return acc
        },
        {} as { [key: number]: number }
      )

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = data.length > 0 ? totalRating / data.length : 0

      return {
        averageRating,
        totalReviews: data.length,
        ratingDistribution,
      }
    } catch (error) {
      console.error('Error fetching business rating stats:', error)
      throw error
    }
  }
}

export const reviewManager = new ReviewManager()
