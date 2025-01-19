import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import serviceService, { CreateServiceInput, UpdateServiceInput } from '@/services/serviceService'
import { useAuthStore } from '@/stores/authStore'
import { useNotification } from '@/contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { Service } from '@/types/business'

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
  maxParticipants: z.number().min(1, 'At least 1 participant required'),
  requiresConfirmation: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceManagementProps {
  businessId: string;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ businessId }) => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { data: services, error: servicesError, mutate: mutateServices } = useSWR(
    businessId ? ['services', businessId] : null,
    () => serviceService.getServices(businessId)
  )

  const { data: categories, error: categoriesError } = useSWR(
    'service-categories',
    () => serviceService.getServiceCategories()
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: '',
      isActive: true,
      maxParticipants: 1,
      requiresConfirmation: false,
    },
  })

  useEffect(() => {
    if (selectedService) {
      reset({
        name: selectedService.name,
        description: selectedService.description || '',
        duration: selectedService.duration,
        price: selectedService.price,
        category: selectedService.category,
        isActive: selectedService.isActive,
        maxParticipants: selectedService.maxParticipants || 1,
        requiresConfirmation: selectedService.requiresConfirmation,
      })
    }
  }, [selectedService, reset])

  const handleCreateService = async (data: ServiceFormData) => {
    try {
      setIsLoading(true)
      const newService = await serviceService.createService(businessId, {
        ...data,
        requiresConfirmation: data.requiresConfirmation || false,
      })
      await mutateServices()
      setIsDialogOpen(false)
      reset()
      showNotification('Service created successfully', 'success')
    } catch (error) {
      console.error('Failed to create service:', error)
      showNotification('Failed to create service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!selectedService) return

    try {
      setIsLoading(true)
      await serviceService.updateService(selectedService.id, {
        ...data,
        requiresConfirmation: data.requiresConfirmation || false,
      })
      await mutateServices()
      setIsDialogOpen(false)
      setSelectedService(null)
      showNotification('Service updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update service:', error)
      showNotification('Failed to update service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async () => {
    if (!selectedService) return

    try {
      setIsLoading(true)
      await serviceService.deleteService(selectedService.id)
      await mutateServices()
      setIsDeleteDialogOpen(false)
      setSelectedService(null)
      showNotification('Service deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete service:', error)
      showNotification('Failed to delete service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service)
    } else {
      reset()
      setSelectedService(null)
    }
    setIsDialogOpen(true)
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please sign in to manage your services
          </Typography>
        </Box>
      </Container>
    )
  }

  if (servicesError || categoriesError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load services or categories. Please try again later.
      </Alert>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Services</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Service
          </Button>
        </Box>

        <Grid container spacing={3}>
          {services?.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>
                  <Typography color="text.secondary" noWrap>
                    {service.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <AccessTimeIcon sx={{ mr: 1 }} />
                      {service.duration} minutes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <MoneyIcon sx={{ mr: 1 }} />
                      ${service.price}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(service)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setSelectedService(service)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit(selectedService ? handleUpdateService : handleCreateService)}>
            <DialogTitle>
              {selectedService ? 'Edit Service' : 'Add Service'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
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
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
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
                          type="number"
                          label="Duration (minutes)"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon />
                              </InputAdornment>
                            ),
                          }}
                          error={!!errors.duration}
                          helperText={errors.duration?.message}
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
                          type="number"
                          label="Price"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MoneyIcon />
                              </InputAdornment>
                            ),
                          }}
                          error={!!errors.price}
                          helperText={errors.price?.message}
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
                            {categories?.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="maxParticipants"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Max Participants"
                          fullWidth
                          error={!!errors.maxParticipants}
                          helperText={errors.maxParticipants?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="requiresConfirmation"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Requires Confirmation"
                        />
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
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isLoading}
                disabled={!isDirty}
              >
                {selectedService ? 'Update' : 'Create'}
              </LoadingButton>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Service</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this service? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              onClick={handleDeleteService}
              color="error"
              loading={isLoading}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default ServiceManagement
