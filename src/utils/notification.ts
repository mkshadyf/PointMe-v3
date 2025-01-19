import { AlertColor } from '@mui/material'

interface NotificationOptions {
  variant?: AlertColor
  autoHideDuration?: number
}

export const showNotification = (
  message: string,
  options?: NotificationOptions
) => {
  // This is a placeholder for your actual notification implementation
  // You might want to use a global state management solution or event system
  console.log(`[Notification] ${message}`, options)
}

export const ToastOptions = {
  SUCCESS: { variant: 'success' as AlertColor },
  ERROR: { variant: 'error' as AlertColor },
  WARNING: { variant: 'warning' as AlertColor },
  INFO: { variant: 'info' as AlertColor }
}
