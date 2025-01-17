import React from 'react';
import { useAuth } from '../lib/auth/AuthProvider';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userRole === 'business'
                ? 'Manage your business and appointments'
                : userRole === 'admin'
                ? 'Monitor and manage the platform'
                : 'Find and book services'}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            {/* Add quick action buttons based on user role */}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Add recent activity list */}
          </Paper>
        </Grid>

        {/* Additional sections based on user role */}
        {userRole === 'business' && (
          <>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 320,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
                {/* Add appointments calendar/list */}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 320,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Business Stats
                </Typography>
                {/* Add business statistics */}
              </Paper>
            </Grid>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Platform Overview
                </Typography>
                {/* Add admin dashboard metrics */}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}
