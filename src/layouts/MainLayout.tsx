import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home,
  CalendarToday,
  Person,
  Business,
  Settings,
  Notifications,
} from '@mui/icons-material'
import { useAuth } from '../lib/auth/AuthProvider'

const drawerWidth = 240

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bottomValue, setBottomValue] = useState(0)
  const { user, userRole, signOut } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Appointments', icon: <CalendarToday />, path: '/appointments' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ]

  if (userRole === 'business') {
    menuItems.push(
      { text: 'Business Profile', icon: <Business />, path: '/business-profile' },
      { text: 'Settings', icon: <Settings />, path: '/business-settings' }
    )
  }

  if (userRole === 'admin') {
    menuItems.push(
      { text: 'Dashboard', icon: <Business />, path: '/admin/dashboard' },
      { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
    )
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          PointMe
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path)
              if (isMobile) setMobileOpen(false)
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            PointMe
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <Notifications />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            onOpen={() => setMobileOpen(true)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mb: { xs: 7, sm: 0 }, // Add margin bottom for mobile to account for bottom navigation
        }}
      >
        <Toolbar /> {/* Add toolbar spacing */}
        <Outlet />
      </Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomValue}
            onChange={(event, newValue) => {
              setBottomValue(newValue)
              navigate(menuItems[newValue].path)
            }}
            showLabels
          >
            {menuItems.slice(0, 4).map((item, index) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}
