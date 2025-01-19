import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Rating } from '@mui/material';
import useSWR, { mutate } from 'swr';
import { createTrpcFetcher, createTrpcKey, createTrpcMutation } from '@/utils/swr-helpers';
import { CreateBusinessReviewInput } from '../types/review';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, 'Comment is required').max(500, 'Comment must be 500 characters or less'),
});

interface BusinessReviewsProps {
  businessId: string;
}

const BusinessReviews: React.FC<BusinessReviewsProps> = ({ businessId }) => {
  const { control, handleSubmit, reset } = useForm<CreateBusinessReviewInput>({
    resolver: zodResolver(createReviewSchema),
  });

  const { data: reviews, error } = useSWR(
    createTrpcKey(['business', 'reviews', 'getBusinessReviews'], businessId),
    createTrpcFetcher(['business', 'reviews', 'getBusinessReviews'], businessId)
  );

  const createReviewMutation = createTrpcMutation(['business', 'reviews', 'createBusinessReview']);

  const onSubmit = async (data: CreateBusinessReviewInput) => {
    try {
      await createReviewMutation({ ...data, businessId });
      reset();
      await mutate(createTrpcKey(['business', 'reviews', 'getBusinessReviews'], businessId));
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <Controller
          name="rating"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Rating
              {...field}
              precision={0.5}
              onChange={(_, value) => field.onChange(value)}
            />
          )}
        />
        <Controller
          name="comment"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="comment"
              label="Your Review"
              multiline
              rows={4}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Submit Review
        </Button>
      </Box>
      {error ? (
        <Typography color="error">Error loading reviews</Typography>
      ) : !reviews ? (
        <Typography>Loading reviews...</Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <ListItem key={review.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Rating value={review.rating} readOnly precision={0.5} />
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      by {review.user.name}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {review.comment}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default BusinessReviews;
