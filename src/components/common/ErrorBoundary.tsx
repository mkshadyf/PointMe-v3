import React, { Component, ErrorInfo } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
} from '@mui/material'
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'
import * as Sentry from '@sentry/react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoBack = () => {
    window.history.back()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              textAlign: 'center',
              borderRadius: 2,
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
                  {this.state.error?.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      mt: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="outlined"
                onClick={this.handleGoBack}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </Stack>
          </Paper>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
