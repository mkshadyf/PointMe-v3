import React from 'react'
import { Container, Typography, Paper, Box } from '@mui/material'
import LoginForm from './LoginForm'
import { useAuthStore } from '../stores/authStore'
import { useNavigate, useLocation } from 'react-router-dom'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Get the redirect path from location state or use default based on role
      const from = (location.state as any)?.from?.pathname

      if (from) {
        navigate(from)
      } else {
        // Default redirects based on role
        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'business_owner':
            navigate('/business/dashboard')
            break
          default:
            navigate('/dashboard')
        }
      }
    }
  }, [isAuthenticated, user, navigate, location])

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign in to PointMe
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
