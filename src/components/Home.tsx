import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to PointMe
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Your one-stop solution for business management and scheduling
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/signup"
            variant="outlined"
            color="primary"
            size="large"
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Home
