import React from 'react'
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Box,
  useTheme,
} from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

interface FallbackProps {
  error: Error
  resetError: () => void
}

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetError,
}) => {
  const theme = useTheme()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          textAlign: 'center',
          borderRadius: 2,
          border: `1px solid ${theme.palette.error.light}`,
        }}
      >
        <ErrorIcon
          color="error"
          sx={{ fontSize: 64, mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          We're sorry for the inconvenience. Please try again or contact
          support if the problem persists.
        </Typography>

        {process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              textAlign: 'left',
            }}
          >
            <Typography variant="subtitle2" color="error">
              {error.toString()}
            </Typography>
          </Box>
        )}

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={handleReload}
          >
            Reload Page
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default ErrorFallback
