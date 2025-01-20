import React from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Divider
} from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { trpc } from '../utils/trpc'
import BusinessReviews from './BusinessReviews'
import { Business, Service } from '../types'

export default function PublicBusinessPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: business, isLoading } = trpc.business.get.useQuery({
    id: businessId!
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!business) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Business not found</Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {business.name}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {business.description}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            Services
          </Typography>
          <Grid container spacing={3}>
            {business.services.map((service: Service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{service.name}</Typography>
                    <Typography color="text.secondary">
                      {service.description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      ${service.price}
                    </Typography>
                    <RouterLink 
                      to={`/book/${service.id}`} 
                      style={{ textDecoration: 'none' }}
                    >
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Book Now
                      </Button>
                    </RouterLink>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            Reviews
          </Typography>
          <BusinessReviews businessId={business.id} />
        </Box>
      </Box>
    </Container>
  )
}
