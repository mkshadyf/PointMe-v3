export interface Review {
  id: string;
  userId: string;
  businessId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface CreateReviewInput {
  businessId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  isPublished?: boolean;
}
