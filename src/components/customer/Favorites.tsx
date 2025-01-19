import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  IconButton,
  Skeleton,
  CircularProgress,
  Button,
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import useSWR, { mutate } from 'swr'
import favoriteService from '../../services/favoriteService'
import { businessService } from '../../services/businessService'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'next/navigation'
import { useNotification } from '../../contexts/NotificationContext'
import Link from 'next/link'

export default function Favorites() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { showNotification } = useNotification()

  const { data: favorites, error } = useSWR(
    ['favorites', user?.id],
    () => favoriteService.getFavoriteBusinesses(user!.id)
  )

  const handleRemoveFavorite = async (businessId: string) => {
    try {
      await favoriteService.removeFavorite(user!.id, businessId)
      await mutate(['favorites', user?.id])
      showNotification('Business removed from favorites', 'success')
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      showNotification('Failed to remove business from favorites', 'error')
    }
  }

  const handleViewBusiness = (businessId: string) => {
    router.push(`/business/${businessId}`)
  }

  if (!user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Please sign in to view your favorites
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/signin"
        >
          Sign In
        </Button>
      </Box>
    )
  }

  const isLoading = !favorites && !error

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Favorites
        </Typography>

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : favorites?.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Start exploring businesses and add them to your favorites
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites?.map((business) => (
              <Grid item xs={12} sm={6} md={4} key={business.id}>
                <BusinessCard
                  business={business}
                  onViewBusiness={() => handleViewBusiness(business.id)}
                  onRemoveFavorite={() => handleRemoveFavorite(business.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}

const BusinessCard: React.FC<{
  business: any;
  onViewBusiness: () => void;
  onRemoveFavorite: () => void;
}> = ({ business, onViewBusiness, onRemoveFavorite }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        transition: 'transform 0.2s ease-in-out',
      },
    }}
    onClick={onViewBusiness}
  >
    <CardMedia
      component="img"
      height="200"
      image={business.coverImage || '/placeholder.jpg'}
      alt={business.name}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Typography variant="h6" gutterBottom>
          {business.name}
        </Typography>
        <IconButton onClick={onRemoveFavorite} sx={{ color: 'error.main' }}>
          <FavoriteIcon />
        </IconButton>
      </Box>

      <Box display="flex" alignItems="center" mb={1}>
        <Rating value={business.rating} readOnly size="small" />
        <Typography variant="body2" color="text.secondary" ml={1}>
          ({business.reviewCount})
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" mb={1}>
        <LocationIcon
          fontSize="small"
          sx={{ color: 'text.secondary', mr: 0.5 }}
        />
        <Typography variant="body2" color="text.secondary">
          {business.location}
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {business.categories.map((category: string) => (
          <Chip
            key={category}
            label={category}
            size="small"
            sx={{ backgroundColor: 'primary.light' }}
          />
        ))}
      </Box>
      <Button
        component={Link}
        href={`/business/${business.id}`}
        variant="contained"
        color="primary"
      >
        View Business
      </Button>
    </CardContent>
  </Card>
)
