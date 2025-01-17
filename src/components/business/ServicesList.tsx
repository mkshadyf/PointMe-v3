import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useQuery } from 'react-query'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  isActive: boolean
}

interface ServicesListProps {
  businessId: string
}

const ServiceCard: React.FC<{
  service: Service
  onEdit: (service: Service) => void
  onToggleActive: (service: Service) => void
}> = ({ service, onEdit, onToggleActive }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    onEdit(service)
  }

  const handleToggleActive = () => {
    handleMenuClose()
    onToggleActive(service)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {service.name}
            </Typography>
            <Chip
              label={service.isActive ? 'Active' : 'Inactive'}
              color={service.isActive ? 'success' : 'default'}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleToggleActive}>
              {service.isActive ? 'Deactivate' : 'Activate'}
            </MenuItem>
          </Menu>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {service.description}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 20, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {service.duration} min
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <AttachMoneyIcon sx={{ fontSize: 20, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {service.price.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const ServicesList: React.FC<ServicesListProps> = ({ businessId }) => {
  // TODO: Replace with actual API call
  const { data: services, isLoading } = useQuery<Service[]>(
    ['services', businessId],
    async () => {
      // Simulated API call
      return [
        {
          id: '1',
          name: 'Basic Haircut',
          description: 'A classic haircut service including washing and styling.',
          duration: 30,
          price: 25.00,
          isActive: true,
        },
        {
          id: '2',
          name: 'Premium Styling',
          description: 'Complete hair styling service with premium products.',
          duration: 60,
          price: 50.00,
          isActive: true,
        },
      ]
    }
  )

  const handleEditService = (service: Service) => {
    // TODO: Implement edit functionality
    console.log('Edit service:', service)
  }

  const handleToggleActive = (service: Service) => {
    // TODO: Implement toggle active functionality
    console.log('Toggle active:', service)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (!services?.length) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body1" color="text.secondary">
          No services found. Add your first service to get started.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {services.map((service) => (
        <Grid item xs={12} sm={6} md={4} key={service.id}>
          <ServiceCard
            service={service}
            onEdit={handleEditService}
            onToggleActive={handleToggleActive}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default ServicesList
