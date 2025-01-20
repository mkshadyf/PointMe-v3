import { SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  Rating,
  Stack,
  Avatar
} from '@mui/material'
import { trpc } from '../utils/trpc'
import { Review } from '../types'
import useAuthStore from '../stores/authStore'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1, 'Review content is required')
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewCardProps {
  review: Review
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
  showActions?: boolean
}

function ReviewCard({ review, onEdit, onDelete, showActions = false }: ReviewCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar src={review.user.avatar || undefined}>
            {review.user.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {review.user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>
        <Rating value={review.rating} readOnly />
        <Typography variant="body1" sx={{ mt: 1 }}>
          {review.content}
        </Typography>
      </CardContent>
      {showActions && (
        <CardActions>
          <Button size="small" onClick={() => onEdit?.(review)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => onDelete?.(review.id)}>
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

interface BusinessReviewsProps {
  businessId: string
  showActions?: boolean
}

export default function BusinessReviews({ businessId, showActions = false }: BusinessReviewsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const utils = trpc.useContext()
  
  const { data: reviews } = trpc.review.list.useQuery({
    businessId
  })

  const createMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate()
      handleCloseDialog()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const updateMutation = trpc.review.update.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate()
      handleCloseDialog()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const deleteMutation = trpc.review.delete.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: editingReview ? {
      rating: editingReview.rating,
      content: editingReview.content
    } : {
      rating: 5,
      content: ''
    }
  })

  const rating = watch('rating')

  const handleOpenDialog = () => {
    setError(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setError(null)
    setIsDialogOpen(false)
    setEditingReview(null)
    reset()
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    reset({
      rating: review.rating,
      content: review.content
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate({ id: reviewId })
    }
  }

  const onSubmit = (data: ReviewFormData) => {
    setError(null)
    if (editingReview) {
      updateMutation.mutate({
        id: editingReview.id,
        ...data
      })
    } else {
      createMutation.mutate({
        businessId,
        ...data
      })
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Reviews</Typography>
        {user && (
          <Button variant="contained" onClick={handleOpenDialog}>
            Write Review
          </Button>
        )}
      </Box>

      <Stack spacing={2}>
        {reviews?.map((review: Review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={showActions ? handleEdit : undefined}
            onDelete={showActions ? handleDelete : undefined}
            showActions={showActions && review.userId === user?.id}
          />
        ))}
      </Stack>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReview ? 'Edit Review' : 'Write a Review'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setValue('rating', value || 0)}
              />
              {errors.rating && (
                <Typography color="error" variant="caption">
                  {errors.rating.message}
                </Typography>
              )}
            </Box>
            <TextField
              margin="normal"
              label="Review"
              fullWidth
              multiline
              rows={4}
              error={!!errors.content}
              helperText={errors.content?.message}
              {...register('content')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
