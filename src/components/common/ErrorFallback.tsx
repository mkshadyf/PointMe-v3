import React from 'react'
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
} from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'
import { FallbackProps } from '@sentry/react'
import { isAppError, getUserFriendlyErrorMessage } from '../../utils/errorHandling'

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetError,
}) => {
  const theme = useTheme()

  const errorMessage = getUserFriendlyErrorMessage(error)
  const isAppErr = isAppError(error)

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
        
        <Typography variant="h6" color="error" gutterBottom>
          {errorMessage}
        </Typography>

        {isAppErr && error.httpStatus && (
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            Error Code: {error.httpStatus}
          </Typography>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          We apologize for the inconvenience. Please try again or contact
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
            <Typography
              variant="caption"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error.stack}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={resetError}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default ErrorFallback
