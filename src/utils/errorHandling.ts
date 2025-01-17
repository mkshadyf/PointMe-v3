import { AxiosError } from 'axios'
import { PostgrestError } from '@supabase/supabase-js'
import * as Sentry from '@sentry/react'

export class AppError extends Error {
  public readonly code: string
  public readonly httpStatus?: number
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: string,
    httpStatus?: number,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.httpStatus = httpStatus
    this.context = context

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export function handleAxiosError(error: AxiosError): AppError {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status
    const data = error.response.data as any

    switch (status) {
      case 401:
        return new AppError(
          data.message || 'Unauthorized access',
          ErrorCodes.UNAUTHORIZED,
          status
        )
      case 403:
        return new AppError(
          data.message || 'Access forbidden',
          ErrorCodes.FORBIDDEN,
          status
        )
      case 404:
        return new AppError(
          data.message || 'Resource not found',
          ErrorCodes.NOT_FOUND,
          status
        )
      case 422:
        return new AppError(
          data.message || 'Validation error',
          ErrorCodes.VALIDATION_ERROR,
          status,
          data.errors
        )
      default:
        return new AppError(
          data.message || 'An unexpected error occurred',
          ErrorCodes.UNKNOWN_ERROR,
          status
        )
    }
  } else if (error.request) {
    // The request was made but no response was received
    return new AppError(
      'Network error - no response received',
      ErrorCodes.NETWORK_ERROR,
      0
    )
  } else {
    // Something happened in setting up the request
    return new AppError(
      error.message || 'An unexpected error occurred',
      ErrorCodes.UNKNOWN_ERROR
    )
  }
}

export function handleSupabaseError(error: PostgrestError): AppError {
  const { message, code, details, hint } = error

  // Log to Sentry for monitoring
  Sentry.captureException(error, {
    extra: {
      code,
      details,
      hint,
    },
  })

  switch (code) {
    case '23505': // unique_violation
      return new AppError(
        'A record with this information already exists',
        ErrorCodes.VALIDATION_ERROR,
        409,
        { details, hint }
      )
    case '23503': // foreign_key_violation
      return new AppError(
        'Referenced record does not exist',
        ErrorCodes.VALIDATION_ERROR,
        409,
        { details, hint }
      )
    case '42P01': // undefined_table
      return new AppError(
        'Database error: Table not found',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details, hint }
      )
    default:
      return new AppError(
        message || 'An unexpected database error occurred',
        ErrorCodes.DATABASE_ERROR,
        500,
        { code, details, hint }
      )
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof AxiosError) {
    return handleAxiosError(error)
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  ) {
    return handleSupabaseError(error as PostgrestError)
  }

  // Log unknown errors to Sentry
  Sentry.captureException(error)

  return new AppError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    ErrorCodes.UNKNOWN_ERROR
  )
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

// Utility function to get user-friendly error messages
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = isAppError(error) ? error : handleError(error)

  switch (appError.code) {
    case ErrorCodes.UNAUTHORIZED:
      return 'Please sign in to continue'
    case ErrorCodes.FORBIDDEN:
      return 'You do not have permission to perform this action'
    case ErrorCodes.NOT_FOUND:
      return 'The requested resource was not found'
    case ErrorCodes.VALIDATION_ERROR:
      return 'Please check your input and try again'
    case ErrorCodes.DATABASE_ERROR:
      return 'A database error occurred. Please try again later'
    case ErrorCodes.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again'
    default:
      return 'An unexpected error occurred. Please try again later'
  }
}
