import React from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import useSWR from 'swr'
import { businessService } from '@/services/businessService'

interface BusinessStats {
  totalAppointments: number;
  totalCustomers: number;
  totalRevenue: number;
  averageRating: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalReviews: number;
}

interface BusinessStatsProps {
  businessId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  description,
  trend 
}) => (
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
        <Typography variant="h6" component="div">
          {value}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography
              variant="caption"
              color={trend.isPositive ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs last month
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  </Paper>
)

export default function BusinessStats({ businessId }: BusinessStatsProps) {
  const { data: stats, error, isLoading } = useSWR<BusinessStats>(
    businessId ? ['businessStats', businessId] : null,
    () => businessService.getBusinessStats(businessId)
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load business statistics. Please try again later.
      </Alert>
    )
  }

  if (!stats) {
    return null
  }

  const completionRate = ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
  const cancellationRate = ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1)
  const noShowRate = ((stats.noShowAppointments / stats.totalAppointments) * 100).toFixed(1)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<CalendarIcon sx={{ color: 'primary.main' }} />}
          description={`${completionRate}% completion rate`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
          description={`${noShowRate}% no-show rate`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<MoneyIcon sx={{ color: 'primary.main' }} />}
          description="Monthly revenue"
          trend={{
            value: 12.5,
            isPositive: true,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<StarIcon sx={{ color: 'primary.main' }} />}
          description={`Based on ${stats.totalReviews} reviews`}
        />
      </Grid>
    </Grid>
  )
}
