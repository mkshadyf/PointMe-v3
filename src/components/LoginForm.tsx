import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { TextField, Button, Box, Typography, Divider, CircularProgress } from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import GoogleIcon from '@mui/icons-material/Google'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  
  const { login, loginWithGoogle, loading, error, clearError, isAuthenticated } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    await login(data.email, data.password)
  }

  const handleGoogleLogin = async () => {
    clearError()
    await loginWithGoogle()
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Controller
        name="email"
        control={control}
        defaultValue=""
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            error={!!error}
            helperText={error?.message}
          />
        )}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        Sign in with Google
      </Button>
    </Box>
  )
}

export default LoginForm
