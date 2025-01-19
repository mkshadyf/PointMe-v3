import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR, { mutate } from 'swr'
import categoryService from '../../services/categoryService'
import { ServiceCategory, UpdateServiceCategoryInput } from '../../types/category'

const serviceCategorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  businessCategoryId: z.string()
    .min(1, 'Business category is required'),
})

interface EditServiceCategoryDialogProps {
  open: boolean
  category: ServiceCategory
  onClose: () => void
}

export default function EditServiceCategoryDialog({
  open,
  onClose,
  category,
}: EditServiceCategoryDialogProps) {
  const { mutate } = useSWR()

  const { data: businessCategories } = useSWR(
    'businessCategories',
    () => categoryService.getBusinessCategories()
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateServiceCategoryInput>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      businessCategoryId: category.businessCategoryId,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        name: category.name,
        description: category.description,
        businessCategoryId: category.businessCategoryId,
      })
    }
  }, [open, category, reset])

  const handleUpdateCategory = async (data: UpdateServiceCategoryInput) => {
    try {
      await categoryService.updateServiceCategory(category.id, data)
      await mutate('serviceCategories')
      onClose()
    } catch (error) {
      console.error('Failed to update service category:', error)
      // Handle error (show notification, etc.)
    }
  }

  const onSubmit = (data: UpdateServiceCategoryInput) => {
    handleUpdateCategory(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Service Category</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Controller
            name="businessCategoryId"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.businessCategoryId}
              >
                <InputLabel>Business Category</InputLabel>
                <Select
                  {...field}
                  label="Business Category"
                >
                  {businessCategories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.businessCategoryId && (
                  <FormHelperText>
                    {errors.businessCategoryId.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

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
