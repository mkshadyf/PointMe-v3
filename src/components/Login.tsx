import React from 'react'
import { Container, Typography, Paper } from '@mui/material'
import LoginForm from './LoginForm'

const Login: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, padding: 4 }}>
        <Typography component="h1" variant="h5" align="center">
          Sign in
        </Typography>
        <LoginForm />
      </Paper>
    </Container>
  )
}

export default Login

