import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  EventAvailable as EventIcon,
  Report as ReportIcon,
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import adminService from '../../services/adminService'
import type { AdminStats } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface StatCard {
  title: string
  value: number
  trend: number
  icon: React.ReactNode
  color: string
}

const Analytics: React.FC = () => {
  const { user } = useAuthStore()
  const [timeRange, setTimeRange] = React.useState('7d')
  const [selectedMetric, setSelectedMetric] = React.useState('users')

  const getDateRange = () => {
    const end = endOfDay(new Date())
    let start
    switch (timeRange) {
      case '24h':
        start = startOfDay(subDays(end, 1))
        break
      case '7d':
        start = startOfDay(subDays(end, 7))
        break
      case '30d':
        start = startOfDay(subDays(end, 30))
        break
      case '90d':
        start = startOfDay(subDays(end, 90))
        break
      default:
        start = startOfDay(subDays(end, 7))
    }
    return { start, end }
  }

  const { data: analyticsData } = useQuery(
    ['analytics', timeRange],
    () => adminService.getAdminStats(),
    {
      refetchInterval: 300000, // 5 minutes
    }
  )

  const stats: StatCard[] = [
    {
      title: 'Total Users',
      value: analyticsData?.totalUsers || 0,
      trend: analyticsData?.userGrowth || 0,
      icon: <PeopleIcon />,
      color: '#2196f3',
    },
    {
      title: 'Active Businesses',
      value: analyticsData?.activeBusinesses || 0,
      trend: analyticsData?.businessGrowth || 0,
      icon: <BusinessIcon />,
      color: '#4caf50',
    },
    {
      title: 'Appointments Today',
      value: analyticsData?.appointmentsToday || 0,
      trend: analyticsData?.appointmentGrowth || 0,
      icon: <EventIcon />,
      color: '#ff9800',
    },
    {
      title: 'Reports',
      value: analyticsData?.totalReports || 0,
      trend: analyticsData?.reportGrowth || 0,
      icon: <ReportIcon />,
      color: '#f44336',
    },
  ]

  const StatCard: React.FC<StatCard> = ({
    title,
    value,
    trend,
    icon,
    color,
  }) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mt={2}>
          {trend > 0 ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography
            variant="body2"
            color={trend > 0 ? 'success.main' : 'error.main'}
            sx={{ ml: 1 }}
          >
            {Math.abs(trend)}% from last period
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )

  const GrowthChart = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">Growth Trends</Typography>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              label="Metric"
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <MenuItem value="users">Users</MenuItem>
              <MenuItem value="businesses">Businesses</MenuItem>
              <MenuItem value="appointments">Appointments</MenuItem>
              <MenuItem value="revenue">Revenue</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer>
          <AreaChart data={analyticsData?.growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

  const CategoryDistribution = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Business Categories
        </Typography>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={analyticsData?.categoryDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {analyticsData?.categoryDistribution.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
            <ChartTooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

  const AppointmentStats = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appointment Status
        </Typography>
        <ResponsiveContainer>
          <BarChart data={analyticsData?.appointmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <ChartTooltip />
            <Bar dataKey="count" fill="#8884d8">
              {analyticsData?.appointmentStats.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have permission to access this page
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Analytics Dashboard</Typography>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <GrowthChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <CategoryDistribution />
          </Grid>
          <Grid item xs={12}>
            <AppointmentStats />
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Analytics
