import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to PointMe
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Your one-stop platform for managing and discovering services
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {!user ? (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Looking for Services?
                    </Typography>
                    <Typography paragraph>
                      Browse through our wide range of services and find exactly
                      what you need.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/services')}
                    >
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Own a Business?
                    </Typography>
                    <Typography paragraph>
                      List your services and reach more customers through our
                      platform.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Services
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/services')}
                      fullWidth
                    >
                      View Services
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Bookings
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/bookings')}
                      fullWidth
                    >
                      View Bookings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Profile
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/profile')}
                      fullWidth
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  )
}

export default Home
