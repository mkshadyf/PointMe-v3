import { SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Stack
} from '@mui/material'
import { trpc } from '../utils/trpc'
import { Business } from '../types'
import useAuthStore from '../stores/authStore'

const businessSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  website: z.string().url().optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'At least one category is required')
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessCardProps {
  business: Business
  onEdit: (business: Business) => void
  onDelete: (businessId: string) => void
}

function BusinessCard({ business, onEdit, onDelete }: BusinessCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{business.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {business.description}
        </Typography>
        <Typography variant="body2">
          Address: {business.address}
        </Typography>
        <Typography variant="body2">
          Phone: {business.phone}
        </Typography>
        <Typography variant="body2">
          Email: {business.email}
        </Typography>
        {business.website && (
          <Typography variant="body2">
            Website: {business.website}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {business.categories.map((category) => (
            <Chip key={category} label={category} size="small" />
          ))}
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(business)}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(business.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

interface BusinessManagementProps {
  onSelectBusiness: (businessId: string | null) => void
}

export default function BusinessManagement({ onSelectBusiness }: BusinessManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const utils = trpc.useContext()
  
  const { data: businesses } = trpc.business.list.useQuery()

  const createMutation = trpc.business.create.useMutation({
    onSuccess: () => {
      utils.business.list.invalidate()
      handleCloseDialog()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const updateMutation = trpc.business.update.useMutation({
    onSuccess: () => {
      utils.business.list.invalidate()
      handleCloseDialog()
    },
    onError: (error: { message: SetStateAction<string | null> }) => {
      setError(error.message)
    }
  })

  const deleteMutation = trpc.business.delete.useMutation({
    onSuccess: () => {
      utils.business.list.invalidate()
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
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: editingBusiness || {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      categories: []
    }
  })

  const handleOpenDialog = () => {
    setError(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setError(null)
    setIsDialogOpen(false)
    setEditingBusiness(null)
    reset()
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    reset({
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website || '',
      categories: business.categories
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      deleteMutation.mutate({ id: businessId })
    }
  }

  const onSubmit = (data: BusinessFormData) => {
    setError(null)
    if (editingBusiness) {
      updateMutation.mutate({
        id: editingBusiness.id,
        ...data
      })
    } else {
      createMutation.mutate(data)
    }
  }

  if (!user) {
    return (
      <Typography>
        Please log in to manage your businesses
      </Typography>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Your Businesses</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          Add Business
        </Button>
      </Box>

      <Grid container spacing={2}>
        {businesses?.map((business: Business) => (
          <Grid item xs={12} sm={6} md={4} key={business.id}>
            <BusinessCard
              business={business}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBusiness ? 'Edit Business' : 'Add New Business'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              margin="normal"
              label="Description"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description')}
            />
            <TextField
              margin="normal"
              label="Address"
              fullWidth
              error={!!errors.address}
              helperText={errors.address?.message}
              {...register('address')}
            />
            <TextField
              margin="normal"
              label="Phone"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              {...register('phone')}
            />
            <TextField
              margin="normal"
              label="Email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              margin="normal"
              label="Website"
              fullWidth
              error={!!errors.website}
              helperText={errors.website?.message}
              {...register('website')}
            />
            <TextField
              margin="normal"
              label="Categories (comma-separated)"
              fullWidth
              error={!!errors.categories}
              helperText={errors.categories?.message}
              {...register('categories')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}