import React from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Chip,
  Rating,
  Button,
  IconButton,
  Skeleton,
} from '@mui/material'
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material'
import useSWR, { useSWRConfig } from 'swr'
import { businessService } from '@/services/businessService'
import favoriteService from '@/services/favoriteService'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/stores/authStore'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate } = useSWRConfig()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [location, setLocation] = React.useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const debouncedLocation = useDebounce(location, 300)

  const { data: businesses, error, isLoading } = useSWR(
    ['businesses', debouncedSearch, debouncedLocation],
    () =>
      businessService.searchBusinesses({
        query: debouncedSearch,
        location: debouncedLocation,
      }),
    {
      enabled: !!(debouncedSearch || debouncedLocation),
    }
  )

  const { data: categories } = useSWR(['categories'], () =>
    businessService.getCategories()
  )

  const { data: favorites } = useSWR(
    ['favorites', user?.id],
    () => favoriteService.getFavorites(user!.id),
    {
      enabled: !!user,
    }
  )

  const handleToggleFavorite = async (businessId: string) => {
    try {
      await favoriteService.toggleFavorite(businessId)
      mutate('businesses')
      mutate(['favorites', user?.id])
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`)
  }

  const BusinessCard: React.FC<{
    business: any
    isFavorite: boolean
  }> = ({ business, isFavorite }) => (
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
    >
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: 'grey.200',
        }}
      >
        {business.coverImage && (
          <Box
            component="img"
            src={business.coverImage}
            alt={business.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleToggleFavorite(business.id)
          }}
        >
          {isFavorite ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </Box>
      <CardContent
        onClick={() => handleBusinessClick(business.id)}
        sx={{ flexGrow: 1 }}
      >
        <Typography variant="h6" gutterBottom>
          {business.name}
        </Typography>
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Find Local Businesses
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {categories && (
          <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={() => setSearchTerm(category.name)}
                clickable
              />
            ))}
          </Box>
        )}

        <Grid container spacing={3}>
          {isLoading
            ? Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton
                    variant="rectangular"
                    height={300}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
              ))
            : businesses?.map((business) => (
                <Grid item xs={12} sm={6} md={4} key={business.id}>
                  <BusinessCard
                    business={business}
                    isFavorite={favorites?.includes(business.id) || false}
                  />
                </Grid>
              ))}
        </Grid>

        {businesses?.length === 0 && !isLoading && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No businesses found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default Home
