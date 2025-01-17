import React from 'react'
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
  ListItemSecondary,
  useTheme,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  notificationService,
  Notification,
  useNotificationSubscription,
} from '../../services/notificationService'
import { format, formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../../stores/authStore'

const NotificationCenter: React.FC = () => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useNotificationSubscription(user?.id || null)

  const { data: notifications = [] } = useQuery(
    ['notifications', user?.id],
    () => notificationService.getNotifications(user!.id),
    {
      enabled: !!user,
    }
  )

  const markAsReadMutation = useMutation(
    (notificationId: string) => notificationService.markAsRead(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications', user?.id])
      },
    }
  )

  const markAllAsReadMutation = useMutation(
    () => notificationService.markAllAsRead(user!.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications', user?.id])
      },
    }
  )

  const deleteNotificationMutation = useMutation(
    (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications', user?.id])
      },
    }
  )

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
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
              onClick={() => markAllAsReadMutation.mutate()}
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
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </Typography>
                      </>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotificationMutation.mutate(notification.id)
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  )
}

export default NotificationCenter
