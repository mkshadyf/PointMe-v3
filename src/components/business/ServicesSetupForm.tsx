import React from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  TextField,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useQuery } from 'react-query'
import categoryService from '../../services/categoryService'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
})

const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, 'Add at least one service'),
})

type ServiceData = z.infer<typeof serviceSchema>
type ServicesFormData = z.infer<typeof servicesSchema>

interface ServicesSetupFormProps {
  categoryId: string
  onSubmit: (services: ServiceData[]) => void
}

const ServicesSetupForm: React.FC<ServicesSetupFormProps> = ({
  categoryId,
  onSubmit,
}) => {
  const { data: serviceCategories, isLoading } = useQuery(
    ['serviceCategories', categoryId],
    () => categoryService.getServiceCategories(categoryId)
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServicesFormData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      services: [{ name: '', description: '', duration: 30, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  })

  const handleFormSubmit = (data: ServicesFormData) => {
    onSubmit(data.services)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Typography variant="h6" gutterBottom>
        Set up your services
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add the services you offer. You can add more services later.
      </Typography>

      {fields.map((field, index) => (
        <Card key={field.id} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name={`services.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Service Name"
                      error={!!errors.services?.[index]?.name}
                      helperText={errors.services?.[index]?.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name={`services.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      error={!!errors.services?.[index]?.description}
                      helperText={errors.services?.[index]?.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name={`services.${index}.duration`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Duration (minutes)"
                      error={!!errors.services?.[index]?.duration}
                      helperText={errors.services?.[index]?.duration?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name={`services.${index}.price`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      fullWidth
                      label="Price"
                      error={!!errors.services?.[index]?.price}
                      helperText={errors.services?.[index]?.price?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {fields.length > 1 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  onClick={() => remove(index)}
                  color="error"
                  aria-label="delete service"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => append({ name: '', description: '', duration: 30, price: 0 })}
        >
          Add Another Service
        </Button>
      </Box>

      {errors.services && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errors.services.message}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
        >
          Complete Setup
        </Button>
      </Box>
    </Box>
  )
}

export default ServicesSetupForm

