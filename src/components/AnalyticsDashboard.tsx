import React from 'react'
import { Typography, Box, Grid, Paper } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { trpc } from '../utils/trpc'

interface AnalyticsDashboardProps {
  businessId: string
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ businessId }) => {
  const analyticsQuery = trpc.business.getAnalytics.useQuery(businessId)

  if (analyticsQuery.isLoading) {
    return <Typography>Loading analytics...</Typography>
  }

  if (analyticsQuery.isError) {
    return <Typography color="error">Error loading analytics</Typography>
  }

  const { totalBookings, totalRevenue, servicePerformance } = analyticsQuery.data

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Bookings</Typography>
            <Typography variant="h4">{totalBookings}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">${totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Service Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#8884d8" name="Bookings" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsDashboard

