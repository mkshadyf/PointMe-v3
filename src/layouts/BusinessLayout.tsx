import React from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import NotificationCenter from '../components/notifications/NotificationCenter'
import UserMenu from '../components/common/UserMenu'
import ErrorBoundary from '../components/common/ErrorBoundary'
import useSWR from 'swr'
import { businessService } from '../services/businessService'
import { useAuthStore } from '../stores/authStore'

const DRAWER_WIDTH = 240

const BusinessLayout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = React.useState(!isMobile)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const { data: business, error } = useSWR(
    user ? ['business', user.id] : null,
    () => businessService.getBusinessByUserId(user!.id)
  )

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Error loading business data</Typography>
      </Box>
    )
  }

  if (!business) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/business' },
    {
      text: 'Appointments',
      icon: <ScheduleIcon />,
      path: '/business/appointments',
    },
    { text: 'Customers', icon: <PeopleIcon />, path: '/business/customers' },
    { text: 'Services', icon: <ReceiptIcon />, path: '/business/services' },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/business/analytics',
    },
    { text: 'Settings', icon: <SettingsIcon />, path: '/business/settings' },
  ]

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              {business?.name || 'Business Dashboard'}
            </Typography>
            {business?.status && (
              <Chip
                label={business.status}
                size="small"
                color={
                  business.status === 'active'
                    ? 'success'
                    : business.status === 'pending'
                    ? 'warning'
                    : 'error'
                }
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <NotificationCenter />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path
                      ? 'primary.main'
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: location.pathname === item.path
                      ? 'primary.main'
                      : 'inherit',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Container>
      </Box>
    </Box>
  )
}

export default BusinessLayout
