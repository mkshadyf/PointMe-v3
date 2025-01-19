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
import { useSWRConfig } from 'swr'
import categoryService from '../../services/categoryService'
import { CreateBusinessCategoryInput } from '../../types/category'

const businessCategorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
})

interface AddBusinessCategoryDialogProps {
  open: boolean
  onClose: () => void
}

const AddBusinessCategoryDialog: React.FC<AddBusinessCategoryDialogProps> = ({
  open,
  onClose,
}) => {
  const { mutate } = useSWRConfig()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBusinessCategoryInput>({
    resolver: zodResolver(businessCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCreateCategory = async (data: CreateBusinessCategoryInput) => {
    try {
      await categoryService.createBusinessCategory(data)
      mutate('businessCategories')
      handleClose()
    } catch (error) {
      console.error('Failed to create business category:', error)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Business Category</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleCreateCategory)} noValidate>
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
          <Button type="submit" variant="contained">
            Add Category
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddBusinessCategoryDialog
