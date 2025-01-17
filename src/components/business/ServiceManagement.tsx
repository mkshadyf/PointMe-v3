import React from 'react'
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
import { useQuery, useMutation, useQueryClient } from 'react-query'
import serviceService from '../../services/serviceService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'

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

const ServiceManagement: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedService, setSelectedService] = React.useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const { data: services, isLoading } = useQuery(
    ['services', user?.id],
    () => serviceService.getBusinessServices(user!.id),
    {
      enabled: !!user,
    }
  )

  const { data: categories } = useQuery('serviceCategories', () =>
    serviceService.getServiceCategories()
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

  React.useEffect(() => {
    if (selectedService) {
      reset(selectedService)
    }
  }, [selectedService, reset])

  const createServiceMutation = useMutation(
    (data: ServiceFormData) => serviceService.createService(user!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services', user?.id])
        showNotification('Service created successfully', 'success')
        handleCloseDialog()
      },
      onError: () => {
        showNotification('Failed to create service', 'error')
      },
    }
  )

  const updateServiceMutation = useMutation(
    (data: ServiceFormData & { id: string }) =>
      serviceService.updateService(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services', user?.id])
        showNotification('Service updated successfully', 'success')
        handleCloseDialog()
      },
      onError: () => {
        showNotification('Failed to update service', 'error')
      },
    }
  )

  const deleteServiceMutation = useMutation(
    (serviceId: string) => serviceService.deleteService(serviceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['services', user?.id])
        showNotification('Service deleted successfully', 'success')
        setDeleteDialogOpen(false)
      },
      onError: () => {
        showNotification('Failed to delete service', 'error')
      },
    }
  )

  const handleOpenDialog = (service?: any) => {
    setSelectedService(service || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedService(null)
    setIsDialogOpen(false)
    reset()
  }

  const handleDeleteClick = (service: any) => {
    setSelectedService(service)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService.id)
    }
  }

  const onSubmit = (data: ServiceFormData) => {
    if (selectedService) {
      updateServiceMutation.mutate({ ...data, id: selectedService.id })
    } else {
      createServiceMutation.mutate(data)
    }
  }

  const ServiceCard: React.FC<{ service: any }> = ({ service }) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography variant="h6" gutterBottom>
            {service.name}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={service.isActive}
                onChange={(e) =>
                  updateServiceMutation.mutate({
                    ...service,
                    isActive: e.target.checked,
                  })
                }
              />
            }
            label={service.isActive ? 'Active' : 'Inactive'}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {service.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon
                fontSize="small"
                sx={{ color: 'text.secondary', mr: 1 }}
              />
              <Typography variant="body2">
                {service.duration} minutes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <MoneyIcon
                fontSize="small"
                sx={{ color: 'text.secondary', mr: 1 }}
              />
              <Typography variant="body2">${service.price}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={1}>
          <Typography variant="body2" color="text.secondary">
            Category: {service.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max Participants: {service.maxParticipants}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Requires Confirmation: {service.requiresConfirmation ? 'Yes' : 'No'}
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
          startIcon={<DeleteIcon />}
          color="error"
          onClick={() => handleDeleteClick(service)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  )

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
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
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>

        {services?.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first service
            </Typography>
          </Box>
        )}

        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedService ? 'Edit Service' : 'Add Service'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
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
                        rows={3}
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
                        label="Duration (minutes)"
                        type="number"
                        fullWidth
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
                        label="Price"
                        type="number"
                        fullWidth
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
                <Grid item xs={12}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select {...field}>
                          {categories?.map((category) => (
                            <MenuItem key={category.id} value={category.name}>
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
                        label="Max Participants"
                        type="number"
                        fullWidth
                        error={!!errors.maxParticipants}
                        helperText={errors.maxParticipants?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={
                  createServiceMutation.isLoading ||
                  updateServiceMutation.isLoading
                }
              >
                {selectedService ? 'Update' : 'Create'}
              </LoadingButton>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Service</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this service? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              loading={deleteServiceMutation.isLoading}
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
