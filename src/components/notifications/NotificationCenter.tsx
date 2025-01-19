import React, { useState } from 'react'
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
  Divider,
  useTheme,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { format, formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { notificationService } from '@/services/notificationService'
import useSWR from 'swr'
import type { Notification } from '@/types/notification'

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  metadata?: Record<string, any>;
  onClick?: () => void;
}

export default function NotificationCenter() {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()

  const { data: notifications, error, mutate } = useSWR<Notification[]>(
    'notifications',
    () => notificationService.getNotifications()
  )

  const handleMarkAsRead = async (notification: NotificationData) => {
    await notificationService.markAsRead(notification.id)
    mutate()
  }

  const handleDismiss = async (notification: NotificationData) => {
    await notificationService.dismiss(notification.id)
    mutate()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setIsOpen(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsOpen(false)
  }

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.onClick) {
      handleMarkAsRead(notification)
    }
    // Handle notification click based on type and metadata
    if (notification.metadata?.link) {
      window.location.href = notification.metadata.link
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main
      case 'warning':
        return theme.palette.warning.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.info.main
    }
  }

  const getNotificationContent = (notification: NotificationData) => {
    switch (notification.type) {
      case 'APPOINTMENT_CREATED':
        return `New appointment scheduled for ${notification.message}`
      case 'APPOINTMENT_CANCELLED':
        return `Appointment cancelled for ${notification.message}`
      case 'MESSAGE_RECEIVED':
        return `New message from ${notification.message}`
      case 'REVIEW_RECEIVED':
        return `New review received with ${notification.message} stars`
      default:
        return notification.message
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'notification-popover' : undefined

  return (
    <>
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => handleMarkAsRead(notifications.find((n) => !n.isRead))}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No notifications
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead
                      ? 'transparent'
                      : 'action.hover',
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDismiss(notification)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box
                    sx={{
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 12,
                        color: getNotificationColor(notification.type),
                      }}
                    />
                  </Box>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          {getNotificationContent(notification)}
                        </Typography>
                        <br />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  )
}
