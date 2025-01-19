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

const UserDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
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
                  My Reviews
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/reviews')}
                  fullWidth
                >
                  View Reviews
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
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {/* Add recent activity component here */}
                <Typography color="text.secondary">
                  No recent activity to show
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default UserDashboard
