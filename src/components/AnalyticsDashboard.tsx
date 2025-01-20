import React from 'react'
import { Typography, Box, Grid, Paper } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { trpc } from '../utils/trpc'

interface AnalyticsDashboardProps {
  businessId: string
}

interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  servicePerformance: Array<{
    name: string;
    bookings: number;
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ businessId }) => {
  const analyticsQuery = trpc.business.getBusinessStats.useQuery({ businessId })

  if (analyticsQuery.isLoading) {
    return <Typography>Loading analytics...</Typography>
  }

  if (analyticsQuery.isError) {
    return <Typography color="error">Error loading analytics</Typography>
  }

  const data = analyticsQuery.data as Analytics

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Bookings</Typography>
            <Typography variant="h4">{data.totalBookings}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">${data.totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Service Performance
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.servicePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsDashboard
