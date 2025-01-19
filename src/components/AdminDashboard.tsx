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
import { trpc } from '@/utils/trpc'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  const { data: stats } = trpc.admin.dashboard.getStats.useQuery()

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {stats?.totalUsers ?? '...'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/users')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Services
                </Typography>
                <Typography variant="h4">
                  {stats?.totalServices ?? '...'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/services')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Manage Services
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Bookings
                </Typography>
                <Typography variant="h4">
                  {stats?.activeBookings ?? '...'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/bookings')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View Bookings
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/reports')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reports
                </Typography>
                {/* Add reports component here */}
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/reports')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View All Reports
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                {/* Add system status component here */}
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/settings')}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default AdminDashboard
