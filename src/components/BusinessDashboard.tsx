import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material'
import useSWR from 'swr'
import { useAuthStore } from '@/stores/authStore'
import { businessService } from '@/services/businessService'
import BusinessStats from './business/BusinessStats'
import AppointmentsList from './business/AppointmentsList'
import ServicesList from './business/ServicesList'
import BusinessHours from './business/BusinessHours'

const BusinessDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: business, error } = useSWR(
    user ? ['business', user.id] : null,
    () => businessService.getBusiness(user!.id)
  )

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">
          Error loading business data
        </Typography>
      </Box>
    )
  }

  if (!business) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              {business.name}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/business/settings')}
            >
              Business Settings
            </Button>
          </Box>
        </Grid>

        {/* Stats Overview */}
        <Grid item xs={12}>
          <BusinessStats businessId={business.id} />
        </Grid>

        {/* Recent Appointments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            <AppointmentsList businessId={business.id} />
          </Paper>
        </Grid>

        {/* Business Hours */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Business Hours
            </Typography>
            <BusinessHours businessId={business.id} />
          </Paper>
        </Grid>

        {/* Services */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Services
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/business/services')}
              >
                Manage Services
              </Button>
            </Box>
            <ServicesList businessId={business.id} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default BusinessDashboard
