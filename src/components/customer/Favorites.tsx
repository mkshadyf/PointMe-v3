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
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import favoriteService from '../../services/favoriteService'
import businessService from '../../services/businessService'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../contexts/NotificationContext'

const Favorites: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    ['favorites', user?.id],
    () => favoriteService.getFavoriteBusinesses(user!.id),
    {
      enabled: !!user,
    }
  )

  const removeFavoriteMutation = useMutation(
    (businessId: string) =>
      favoriteService.removeFavorite(user!.id, businessId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites', user?.id])
        showNotification('Business removed from favorites', 'success')
      },
      onError: () => {
        showNotification(
          'Failed to remove business from favorites',
          'error'
        )
      },
    }
  )

  const handleRemoveFavorite = (
    e: React.MouseEvent,
    businessId: string
  ) => {
    e.stopPropagation()
    removeFavoriteMutation.mutate(businessId)
  }

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`)
  }

  const BusinessCard: React.FC<{ business: any }> = ({ business }) => (
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
      onClick={() => handleBusinessClick(business.id)}
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
          <IconButton
            onClick={(e) => handleRemoveFavorite(e, business.id)}
            sx={{ color: 'error.main' }}
          >
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
      </CardContent>
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
            Please sign in to view your favorites
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Favorites
        </Typography>

        {favoritesLoading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={300}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : favorites?.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start exploring businesses and add them to your favorites
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites?.map((business) => (
              <Grid item xs={12} sm={6} md={4} key={business.id}>
                <BusinessCard business={business} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}

export default Favorites

