import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Rating } from '@mui/material'
import { trpc } from '../utils/trpc'
import { CreateReviewInput } from '../types/review'

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, 'Comment is required').max(500, 'Comment must be 500 characters or less'),
})

interface ServiceReviewsProps {
  serviceId: string
}

const ServiceReviews: React.FC<ServiceReviewsProps> = ({ serviceId }) => {
  const { control, handleSubmit, reset } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
  })

  const createReviewMutation = trpc.business.createReview.useMutation()
  const reviewsQuery = trpc.business.getServiceReviews.useQuery(serviceId)

  const onSubmit = async (data: CreateReviewInput) => {
    try {
      await createReviewMutation.mutateAsync({ ...data, serviceId })
      reset()
      reviewsQuery.refetch()
    } catch (error) {
      console.error('Failed to create review:', error)
    }
  }

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
      {reviewsQuery.isLoading ? (
        <Typography>Loading reviews...</Typography>
      ) : reviewsQuery.isError ? (
        <Typography color="error">Error loading reviews</Typography>
      ) : (
        <List>
          {reviewsQuery.data?.map((review) => (
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
  )
}

export default ServiceReviews

