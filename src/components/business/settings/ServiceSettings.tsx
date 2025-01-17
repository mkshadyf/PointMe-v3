import React from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serviceService from '@/services/serviceService'
import categoryService from '@/services/categoryService'
import type { Service } from '@/types/business'
import type { ServiceCategory, CreateServiceInput, UpdateServiceInput } from '@/types/category'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface ServiceSettingsProps {
  businessId: string
}

const serviceSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  price: z.number()
    .min(0, 'Price must be greater than or equal to 0'),
  duration: z.number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration must be less than 8 hours'),
  category: z.string()
    .min(1, 'Category is required'),
  isActive: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const ServiceSettings: React.FC<ServiceSettingsProps> = ({ businessId }) => {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedService, setSelectedService] = React.useState<Service | null>(null)

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', businessId],
    queryFn: () => serviceService.getServices(businessId),
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => categoryService.getServiceCategories(),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: '',
      isActive: true,
    },
  })

  const createServiceMutation = useMutation({
    mutationFn: (data: CreateServiceInput) => serviceService.createService(businessId, {
      ...data,
      requiresConfirmation: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] })
      handleCloseDialog()
      reset()
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: (data: UpdateServiceInput & { id: string }) => {
      const { id, ...updateData } = data
      return serviceService.updateService(id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] })
      handleCloseDialog()
      reset()
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] })
    },
  })

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service)
      reset({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive,
      })
    } else {
      setSelectedService(null)
      reset({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: '',
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedService(null)
    reset()
  }

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (selectedService) {
        await updateServiceMutation.mutateAsync({ id: selectedService.id, ...data })
      } else {
        await createServiceMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error('Failed to save service:', error)
      // Show error notification
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteServiceMutation.mutateAsync(serviceId)
        // Show success notification
      } catch (error) {
        console.error('Failed to delete service:', error)
        // Show error notification
      }
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Services</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Service
            </Button>
          </Box>

          <Grid container spacing={2}>
            {services?.map((service) => (
              <Grid item xs={12} key={service.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="body1">
                          ${service.price.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {service.duration} min
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={service.isActive}
                              onChange={() =>
                                updateServiceMutation.mutate({
                                  id: service.id,
                                  isActive: !service.isActive,
                                })
                              }
                            />
                          }
                          label={service.isActive ? 'Active' : 'Inactive'}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Box display="flex" justifyContent="flex-end">
                          <IconButton
                            onClick={() => handleOpenDialog(service)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(service.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {selectedService ? 'Edit Service' : 'Add Service'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Service Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price"
                      fullWidth
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Duration (minutes)"
                      fullWidth
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">min</InputAdornment>
                        ),
                      }}
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        {categories?.map((category: ServiceCategory) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {selectedService ? 'Save Changes' : 'Add Service'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default ServiceSettings
