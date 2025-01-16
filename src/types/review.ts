export interface BusinessReview {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateBusinessReviewInput {
  businessId: string;
  rating: number;
  comment: string;
}

