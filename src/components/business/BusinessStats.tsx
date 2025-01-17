import React from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { useQuery } from 'react-query'

interface BusinessStats {
  totalAppointments: number
  totalCustomers: number
  totalRevenue: number
  averageRating: number
}

interface BusinessStatsProps {
  businessId: string
}

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  loading?: boolean
}> = ({ title, value, icon, loading }) => (
  <Paper sx={{ p: 2 }}>
    <Box display="flex" alignItems="center">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.light',
          borderRadius: 1,
          width: 40,
          height: 40,
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h6" component="div">
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
)

const BusinessStats: React.FC<BusinessStatsProps> = ({ businessId }) => {
  // TODO: Replace with actual API call
  const { data: stats, isLoading } = useQuery<BusinessStats>(
    ['businessStats', businessId],
    async () => {
      // Simulated API call
      return {
        totalAppointments: 150,
        totalCustomers: 85,
        totalRevenue: 12500,
        averageRating: 4.8,
      }
    }
  )

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={<CalendarIcon sx={{ color: 'primary.main' }} />}
          loading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={<PersonIcon sx={{ color: 'primary.main' }} />}
          loading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toLocaleString() || 0}`}
          icon={<MoneyIcon sx={{ color: 'primary.main' }} />}
          loading={isLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Rating"
          value={stats?.averageRating.toFixed(1) || 0}
          icon={<StarIcon sx={{ color: 'primary.main' }} />}
          loading={isLoading}
        />
      </Grid>
    </Grid>
  )
}

export default BusinessStats
