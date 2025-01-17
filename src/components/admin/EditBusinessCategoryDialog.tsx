import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from 'react-query'
import categoryService from '../../services/categoryService'
import { BusinessCategory, UpdateBusinessCategoryInput } from '../../types/category'

const businessCategorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
})

interface EditBusinessCategoryDialogProps {
  open: boolean
  category: BusinessCategory
  onClose: () => void
}

const EditBusinessCategoryDialog: React.FC<EditBusinessCategoryDialogProps> = ({
  open,
  category,
  onClose,
}) => {
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateBusinessCategoryInput>({
    resolver: zodResolver(businessCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        name: category.name,
        description: category.description,
      })
    }
  }, [open, category, reset])

  const updateMutation = useMutation(
    (data: UpdateBusinessCategoryInput) => 
      categoryService.updateBusinessCategory(category.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('businessCategories')
        handleClose()
      },
    }
  )

  const onSubmit = async (data: UpdateBusinessCategoryInput) => {
    try {
      await updateMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to update business category:', error)
      // Handle error (show notification, etc.)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Business Category</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Category Name"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Description"
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isDirty}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default EditBusinessCategoryDialog
