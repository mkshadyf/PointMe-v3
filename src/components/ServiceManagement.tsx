import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { trpc } from '../utils/trpc'
import { CreateServiceInput, UpdateServiceInput, Service } from '../types/service'
import RoleBasedAccess from './RoleBasedAccess'
import ServiceReviews from './ServiceReviews'
import ServiceSearch from './ServiceSearch'

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  price: z.number().positive('Price must be positive'),
  duration: z.number().int().positive('Duration must be a positive integer'),
})

interface ServiceManagementProps {
  businessId: string
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ businessId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<UpdateServiceInput | null>(null)
  const [filteredServices, setFilteredServices] = useState<Service[]>([])

  const { control, handleSubmit, reset } = useForm<CreateServiceInput>({
    resolver: zodResolver(serviceSchema),
  })

  const createServiceMutation = trpc.business.createService.useMutation()
  const updateServiceMutation = trpc.business.updateService.useMutation()
  const servicesQuery = trpc.business.getBusinessServices.useQuery(businessId)

  const onSubmit = async (data: CreateServiceInput) => {
    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({ id: editingService.id!, data })
      } else {
        await createServiceMutation.mutateAsync({ ...data, businessId })
      }
      reset()
      setIsDialogOpen(false)
      setEditingService(null)
      servicesQuery.refetch()
    } catch (error) {
      console.error('Failed to save service:', error)
    }
  }

  const handleEditService = (service: UpdateServiceInput) => {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  const handleSearch = (searchTerm: string, priceRange: [number, number], duration: number | null) => {
    const filtered = servicesQuery.data?.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1]
      const matchesDuration = duration === null || service.duration === duration
      return matchesSearch && matchesPrice && matchesDuration
    })
    setFilteredServices(filtered || [])
  }

  const displayedServices = filteredServices.length > 0 ? filteredServices : servicesQuery.data || []

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Services
      </Typography>
      <ServiceSearch onSearch={handleSearch} />
      <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
        <Button variant="contained" onClick={() => setIsDialogOpen(true)} sx={{ mb: 2 }}>
          Add New Service
        </Button>
      </RoleBasedAccess>
      {servicesQuery.isLoading ? (
        <Typography>Loading services...</Typography>
      ) : servicesQuery.isError ? (
        <Typography color="error">Error loading services</Typography>
      ) : (
        <List>
          {displayedServices.map((service) => (
            <ListItem key={service.id}>
              <Accordion sx={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ListItemText 
                    primary={service.name} 
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          ${service.price.toFixed(2)} - {service.duration} minutes
                        </Typography>
                        <br />
                        {service.description}
                      </>
                    }
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <ServiceReviews serviceId={service.id} />
                </AccordionDetails>
              </Accordion>
              <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
                <Button onClick={() => handleEditService(service)}>
                  Edit
                </Button>
              </RoleBasedAccess>
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              defaultValue={editingService?.name || ''}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Service Name"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              defaultValue={editingService?.description || ''}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="description"
                  label="Service Description"
                  multiline
                  rows={4}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              defaultValue={editingService?.price || 0}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="price"
                  label="Price"
                  type="number"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="duration"
              control={control}
              defaultValue={editingService?.duration || 0}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="duration"
                  label="Duration (minutes)"
                  type="number"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ServiceManagement

