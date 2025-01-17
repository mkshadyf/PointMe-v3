import React, { createContext, useContext, useCallback, useState } from 'react'
import {
  Snackbar,
  Alert,
  AlertColor,
  Typography,
  IconButton,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface NotificationContextType {
  showNotification: (
    message: string,
    severity?: AlertColor,
    duration?: number
  ) => void
  clearNotification: () => void
}

interface NotificationProviderProps {
  children: React.ReactNode
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<AlertColor>('info')
  const [duration, setDuration] = useState(6000)

  const showNotification = useCallback(
    (
      newMessage: string,
      newSeverity: AlertColor = 'info',
      newDuration: number = 6000
    ) => {
      setMessage(newMessage)
      setSeverity(newSeverity)
      setDuration(newDuration)
      setOpen(true)
    },
    []
  )

  const clearNotification = useCallback(() => {
    setOpen(false)
  }, [])

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return
    }
    clearNotification()
  }

  return (
    <NotificationContext.Provider value={{ showNotification, clearNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <Box display="flex" alignItems="center">
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <Typography variant="body2">{message}</Typography>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    )
  }
  return context
}

export default NotificationContext
