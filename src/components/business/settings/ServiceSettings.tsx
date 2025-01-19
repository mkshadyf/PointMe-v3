import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useSWR, { mutate } from 'swr'
import { Service, CreateServiceInput, UpdateServiceInput } from '@/types/service'
import { ServiceCategory } from '@/types/service'
import serviceService from '@/services/serviceService'
import categoryService from '@/services/categoryService'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

interface ServiceSettingsProps {
  businessId: string
}

const serviceSchema = z.object({
  name: z.string()
    .min(1, 'Service name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration must be less than 8 hours'),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000, 'Price must be less than 10000'),
  category: z.string()
    .min(1, 'Category is required'),
  isEnabled: z.boolean(),
  maxParticipants: z.number()
    .min(1, 'Maximum participants must be at least 1')
    .optional(),
  requiresDeposit: z.boolean(),
  depositAmount: z.number()
    .min(0, 'Deposit amount must be positive')
    .optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const ServiceSettings: React.FC<ServiceSettingsProps> = ({ businessId }) => {
  const { data: services, error, mutate: mutateServices } = useSWR(
    ['services', businessId],
    () => serviceService.getServices(businessId)
  )

  const { data: categories, error: categoriesError } = useSWR(
    ['serviceCategories'],
    () => categoryService.getServiceCategories()
  )

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedService, setSelectedService] = React.useState<Service | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: selectedService || {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: '',
      isEnabled: true,
      maxParticipants: 1,
      requiresDeposit: false,
      depositAmount: 0,
    },
  })

  const handleAddService = async (data: ServiceFormData) => {
    try {
      await serviceService.createService({
        ...data,
        businessId,
      })
      mutateServices()
      handleCloseDialog()
      reset()
    } catch (error) {
      console.error('Failed to create service:', error)
    }
  }

  const handleUpdateService = async (serviceId: string, data: UpdateServiceInput) => {
    try {
      const { id, ...updateData } = { id: serviceId, ...data }
      await serviceService.updateService(id, updateData)
      mutateServices()
      handleCloseDialog()
      reset()
    } catch (error) {
      console.error('Failed to update service:', error)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      await serviceService.deleteService(serviceId)
      mutateServices()
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setSelectedService(service)
      reset({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category || '',
        isEnabled: service.isEnabled,
        maxParticipants: service.maxParticipants,
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount,
      })
    } else {
      setSelectedService(null)
      reset({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        category: '',
        isEnabled: true,
        maxParticipants: 1,
        requiresDeposit: false,
        depositAmount: 0,
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
        await handleUpdateService(selectedService.id, data)
      } else {
        await handleAddService(data)
      }
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  if (error || !categories) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Services</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
              Add Service
            </Button>
          </Grid>

          {services?.map((service: Service) => (
            <Grid item xs={12} key={service.id}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">{service.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {service.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2">
                        Price: ${service.price}
                      </Typography>
                      <Typography variant="body2">
                        Duration: {service.duration}min
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={service.isEnabled}
                            onChange={() =>
                              handleUpdateService(service.id, { isEnabled: !service.isEnabled })
                            }
                          />
                        }
                        label={service.isEnabled ? 'Enabled' : 'Disabled'}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => handleOpenDialog(service)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteService(service.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              {selectedService ? 'Edit Service' : 'Add Service'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Name"
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

                <Grid item xs={6}>
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

                <Grid item xs={6}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price ($)"
                        type="number"
                        fullWidth
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
                    name="maxParticipants"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Maximum Participants"
                        type="number"
                        fullWidth
                        error={!!errors.maxParticipants}
                        helperText={errors.maxParticipants?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="requiresDeposit"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Requires Deposit"
                      />
                    )}
                  />
                </Grid>

                {control.watch('requiresDeposit') && (
                  <Grid item xs={12}>
                    <Controller
                      name="depositAmount"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Deposit Amount ($)"
                          type="number"
                          fullWidth
                          error={!!errors.depositAmount}
                          helperText={errors.depositAmount?.message}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Controller
                    name="isEnabled"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Enable Service"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {selectedService ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default ServiceSettings
