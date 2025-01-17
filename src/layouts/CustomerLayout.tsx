import React from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import NotificationCenter from '../components/notifications/NotificationCenter'
import UserMenu from '../components/common/UserMenu'
import ErrorBoundary from '../components/common/ErrorBoundary'

const CustomerLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    {
      label: 'Search',
      icon: <SearchIcon />,
      path: '/search',
    },
    {
      label: 'Appointments',
      icon: <ScheduleIcon />,
      path: '/appointments',
    },
    {
      label: 'Favorites',
      icon: <FavoriteIcon />,
      path: '/favorites',
    },
    {
      label: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
    },
  ]

  const getCurrentNavigationValue = () => {
    const currentPath = location.pathname
    const index = navigationItems.findIndex((item) =>
      currentPath.startsWith(item.path)
    )
    return index >= 0 ? index : 0
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PointMe
          </Typography>
          <NotificationCenter />
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 7, sm: 8 },
          pb: { xs: 7, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth="lg">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Container>
      </Box>

      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation
            value={getCurrentNavigationValue()}
            onChange={(_, newValue) => {
              navigate(navigationItems[newValue].path)
            }}
            showLabels
          >
            {navigationItems.map((item) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}

export default CustomerLayout
