import React from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Container,
} from '@mui/material'
import useSWR from 'swr'
import { createTrpcFetcher, createTrpcKey } from '@/utils/swr-helpers'
import type { AdminStats } from '@/types/admin'
import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material'

const StatCard: React.FC<{
  title: string
  value: number
  growth?: number
  icon: React.ReactNode
}> = ({ title, value, growth, icon }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" component="div">
            {value.toLocaleString()}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {growth !== undefined && (
            <Typography
              variant="body2"
              color={growth >= 0 ? 'success.main' : 'error.main'}
            >
              {growth >= 0 ? '+' : ''}{growth}% from last month
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: 'primary.light',
            borderRadius: '50%',
            padding: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  const { data: users, error: usersError } = useSWR(
    createTrpcKey(['admin', 'getAllUsers']),
    createTrpcFetcher(['admin', 'getAllUsers'])
  )

  const { data: businesses, error: businessesError } = useSWR(
    createTrpcKey(['admin', 'getAllBusinesses']),
    createTrpcFetcher(['admin', 'getAllBusinesses'])
  )

  const { data: bookings, error: bookingsError } = useSWR(
    createTrpcKey(['admin', 'getAllBookings']),
    createTrpcFetcher(['admin', 'getAllBookings'])
  )

  const { data: revenue, error: revenueError } = useSWR(
    createTrpcKey(['admin', 'getRevenueStats']),
    createTrpcFetcher(['admin', 'getRevenueStats'])
  )

  if (usersError || businessesError || bookingsError || revenueError) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">
          Error loading admin data
        </Typography>
      </Box>
    )
  }

  if (!users || !businesses || !bookings || !revenue) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={businesses.length}
            icon={<BusinessIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            icon={<EventIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={revenue.total}
            icon={<PersonIcon />}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
