import React, { Component, ErrorInfo, ReactNode } from 'react'
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
  FallbackComponent: React.ComponentType<{
    error: Error
    resetError: () => void
  }>
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
    })

    // Log error to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <this.props.FallbackComponent
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
