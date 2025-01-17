import React from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import adminService from '../../services/adminService'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Business } from '../../types/business'
import { AdminStats } from '../../types/admin'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: stats } = useQuery<AdminStats>(['adminStats'], () =>
    adminService.getAdminStats()
  )

  const { data: pendingBusinesses } = useQuery<Business[]>(
    ['pendingBusinesses'],
    () => adminService.getPendingBusinesses()
  )

  const approveMutation = useMutation(
    (businessId: string) => adminService.approveBusinesses(businessId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingBusinesses'])
      },
      onError: (error: Error) => {
        console.error('Error approving business:', error)
      },
    }
  )

  const rejectMutation = useMutation(
    (businessId: string) => adminService.rejectBusiness(businessId, 'Application rejected'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingBusinesses'])
      },
      onError: (error: Error) => {
        console.error('Error rejecting business:', error)
      },
    }
  )

  const handleApprove = async (businessId: string) => {
    try {
      await approveMutation.mutateAsync(businessId)
    } catch (error) {
      console.error('Error approving business:', error)
    }
  }

  const handleReject = async (businessId: string) => {
    try {
      await rejectMutation.mutateAsync(businessId)
    } catch (error) {
      console.error('Error rejecting business:', error)
    }
  }

  const StatCard: React.FC<{
    title: string
    value: number
    icon: React.ReactNode
  }> = ({ title, value, icon }) => (
    <Card>
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={stats?.totalBusinesses || 0}
            icon={<BusinessIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Appointments"
            value={stats?.totalAppointments || 0}
            icon={<EventIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={<GroupIcon />}
          />
        </Grid>

        {/* Recent Businesses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Recent Businesses</Typography>
              <Button
                size="small"
                onClick={() => navigate('/admin/businesses')}
              >
                View All
              </Button>
            </Box>
            <List>
              {pendingBusinesses?.map((business) => (
                <React.Fragment key={business.id}>
                  <ListItem
                    secondaryAction={
                      <Chip
                        label={business.status}
                        color={
                          business.status === 'approved'
                            ? 'success'
                            : business.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    }
                  >
                    <ListItemText
                      primary={business.name}
                      secondary={format(
                        new Date(business.createdAt),
                        'MMM d, yyyy'
                      )}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Pending Approvals</Typography>
              <Button
                size="small"
                onClick={() => navigate('/admin/approvals')}
              >
                View All
              </Button>
            </Box>
            <List>
              {pendingBusinesses?.map((approval) => (
                <React.Fragment key={approval.id}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="approve"
                          onClick={() => handleApprove(approval.id)}
                          color="primary"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="reject"
                          onClick={() => handleReject(approval.id)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={approval.name}
                      secondary={`Status: ${approval.status}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {!pendingBusinesses?.length && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                >
                  No pending approvals
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={() => navigate('/admin/categories')}
                >
                  Manage Categories
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/admin/businesses')}
                >
                  View Businesses
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/admin/settings')}
                >
                  System Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AdminDashboard
