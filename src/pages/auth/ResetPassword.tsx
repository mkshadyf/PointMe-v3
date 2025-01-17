import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';

interface ResetPasswordForm {
  email: string;
}

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

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
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          {success ? (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Alert severity="success">
                Password reset instructions have been sent to your email.
              </Alert>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link href="/login" variant="body2">
                  Return to login
                </Link>
              </Box>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ mt: 1, width: '100%' }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Reset Password
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link href="/login" variant="body2">
                  Back to login
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
