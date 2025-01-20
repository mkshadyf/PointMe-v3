import { SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { trpc } from '../utils/trpc'
import { Service } from '../types'

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes')
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (serviceId: string) => void
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{service.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {service.description}
        </Typography>
        <Typography variant="body1">
          Price: ${service.price.toFixed(2)}
        </Typography>
        <Typography variant="body1">
          Duration: {service.duration} minutes
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => onEdit(service)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(service.id)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}

interface ServiceManagementProps {
  businessId: string
}

export default function ServiceManagement({ businessId }: ServiceManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)

  const utils = trpc.useContext()
  
  const { data: services } = trpc.service.list.useQuery({ businessId })
  
  const createMutation = trpc.service.create.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate({ businessId })
      setIsDialogOpen(false)
      reset()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const updateMutation = trpc.service.update.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate({ businessId })
      setIsDialogOpen(false)
      setEditingService(null)
      reset()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const deleteMutation = trpc.service.delete.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate({ businessId })
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: editingService || {
      name: '',
      description: '',
      price: 0,
      duration: 30
    }
  })

  const handleOpenDialog = () => {
    setError(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setError(null)
    setIsDialogOpen(false)
    setEditingService(null)
    reset()
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    reset({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate({ id: serviceId })
    }
  }

  const onSubmit = (data: ServiceFormData) => {
    setError(null)
    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        ...data
      })
    } else {
      createMutation.mutate({
        businessId,
        ...data
      })
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Services</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          Add Service
        </Button>
      </Box>

      <Grid container spacing={2}>
        {services?.map((service: Service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <ServiceCard
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description')}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              error={!!errors.price}
              helperText={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
            <TextField
              margin="dense"
              label="Duration (minutes)"
              type="number"
              fullWidth
              error={!!errors.duration}
              helperText={errors.duration?.message}
              {...register('duration', { valueAsNumber: true })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
