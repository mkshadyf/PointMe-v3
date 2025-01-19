import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-red-600">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-center">
                {this.state.error?.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center space-x-4">
              <Button onClick={this.handleReload} variant="outline">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
