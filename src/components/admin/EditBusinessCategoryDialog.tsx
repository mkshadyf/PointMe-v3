import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSWRConfig } from 'swr'
import categoryService from '../../services/categoryService'
import { BusinessCategory } from '../../types/category'

const businessCategorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  isActive: z.boolean(),
})

type BusinessCategoryFormData = z.infer<typeof businessCategorySchema>

interface EditBusinessCategoryDialogProps {
  open: boolean
  onClose: () => void
  category: BusinessCategory
}

const EditBusinessCategoryDialog: React.FC<EditBusinessCategoryDialogProps> = ({
  open,
  onClose,
  category,
}) => {
  const { mutate } = useSWRConfig()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessCategoryFormData>({
    resolver: zodResolver(businessCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleUpdateCategory = async (data: BusinessCategoryFormData) => {
    try {
      await categoryService.updateBusinessCategory(category.id, data)
      mutate('businessCategories')
      handleClose()
    } catch (error) {
      console.error('Failed to update business category:', error)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Business Category</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleUpdateCategory)} noValidate>
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
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Active"
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Update Category
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default EditBusinessCategoryDialog
