import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Link,
  Alert,
} from '@mui/material';

export default function VerifyEmail() {
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
          <Typography component="h1" variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
            We've sent a verification email to your address. Please check your inbox
            and click the verification link to complete your registration.
          </Alert>
          <Typography variant="body1" align="center" gutterBottom>
            Didn't receive the email? Check your spam folder or click below to
            resend the verification email.
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Return to login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
