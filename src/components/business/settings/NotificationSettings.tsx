import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material'
import useSWR, { useSWRConfig, mutate } from 'swr'
import { businessService } from '@/services/businessService'
import { NotificationSettings as NotificationSettingsType } from '@/types/business'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface NotificationSettingsProps {
  businessId: string
}

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  reminderTime: z.number()
    .min(0, 'Reminder time must be greater than or equal to 0')
    .max(72, 'Reminder time must be less than or equal to 72 hours'),
  notifyOnNewBooking: z.boolean(),
  notifyOnCancellation: z.boolean(),
  notifyOnReschedule: z.boolean(),
  notifyOnReview: z.boolean(),
  emailRecipients: z.array(z.string().email('Invalid email address')),
  phoneRecipients: z.array(z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')),
})

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ businessId }) => {
  const [isAddingEmail, setIsAddingEmail] = React.useState(false)
  const [isAddingPhone, setIsAddingPhone] = React.useState(false)
  const [newEmail, setNewEmail] = React.useState('')
  const [newPhone, setNewPhone] = React.useState('')

  const { data: notificationSettings, error } = useSWR(
    ['notificationSettings', businessId],
    () => businessService.getNotificationSettings(businessId)
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: notificationSettings?.emailNotifications || false,
      smsNotifications: notificationSettings?.smsNotifications || false,
      pushNotifications: notificationSettings?.pushNotifications || false,
      reminderTime: notificationSettings?.reminderTime || 24,
      notifyOnNewBooking: notificationSettings?.notifyOnNewBooking || true,
      notifyOnCancellation: notificationSettings?.notifyOnCancellation || true,
      notifyOnReschedule: notificationSettings?.notifyOnReschedule || true,
      notifyOnReview: notificationSettings?.notifyOnReview || true,
      emailRecipients: notificationSettings?.emailRecipients || [],
      phoneRecipients: notificationSettings?.phoneRecipients || [],
    },
  })

  const emailNotifications = watch('emailNotifications')
  const smsNotifications = watch('smsNotifications')
  const emailRecipients = watch('emailRecipients')
  const phoneRecipients = watch('phoneRecipients')

  const handleUpdateSettings = async (data: NotificationSettingsFormData) => {
    try {
      await businessService.updateNotificationSettings(businessId, data)
      await mutate(['notificationSettings', businessId])
    } catch (error) {
      console.error('Failed to update notification settings:', error)
    }
  }

  const onSubmit = async (data: NotificationSettingsFormData) => {
    await handleUpdateSettings(data)
  }

  const handleAddEmail = () => {
    if (newEmail && !emailRecipients.includes(newEmail)) {
      setValue('emailRecipients', [...emailRecipients, newEmail])
      setNewEmail('')
      setIsAddingEmail(false)
    }
  }

  const handleRemoveEmail = (email: string) => {
    setValue(
      'emailRecipients',
      emailRecipients.filter((e) => e !== email)
    )
  }

  const handleAddPhone = () => {
    if (newPhone && !phoneRecipients.includes(newPhone)) {
      setValue('phoneRecipients', [...phoneRecipients, newPhone])
      setNewPhone('')
      setIsAddingPhone(false)
    }
  }

  const handleRemovePhone = (phone: string) => {
    setValue(
      'phoneRecipients',
      phoneRecipients.filter((p) => p !== phone)
    )
  }

  if (!notificationSettings) {
    return null // Or show loading spinner
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Methods
              </Typography>
              <Box mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="emailNotifications"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Email Notifications"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="smsNotifications"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="SMS Notifications"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="pushNotifications"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Push Notifications"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Notification Events
              </Typography>
              <Box mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="notifyOnNewBooking"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="New Bookings"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="notifyOnCancellation"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Cancellations"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="notifyOnReschedule"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Reschedules"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="notifyOnReview"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="New Reviews"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Reminder Settings
              </Typography>
              <Box mb={3}>
                <Controller
                  name="reminderTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Send Reminders Before (Hours)"
                      type="number"
                      fullWidth
                      error={!!errors.reminderTime}
                      helperText={errors.reminderTime?.message}
                    />
                  )}
                />
              </Box>

              {emailNotifications && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Email Recipients
                  </Typography>
                  <Box mb={3}>
                    {emailRecipients.map((email) => (
                      <Box
                        key={email}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography>{email}</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                    {isAddingEmail ? (
                      <Box display="flex" gap={1} mt={2}>
                        <TextField
                          size="small"
                          label="Email Address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          fullWidth
                        />
                        <Button onClick={handleAddEmail}>Add</Button>
                        <Button
                          color="inherit"
                          onClick={() => setIsAddingEmail(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        onClick={() => setIsAddingEmail(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Email Recipient
                      </Button>
                    )}
                  </Box>
                </>
              )}

              {smsNotifications && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Phone Recipients
                  </Typography>
                  <Box mb={3}>
                    {phoneRecipients.map((phone) => (
                      <Box
                        key={phone}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography>{phone}</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemovePhone(phone)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                    {isAddingPhone ? (
                      <Box display="flex" gap={1} mt={2}>
                        <TextField
                          size="small"
                          label="Phone Number"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          fullWidth
                        />
                        <Button onClick={handleAddPhone}>Add</Button>
                        <Button
                          color="inherit"
                          onClick={() => setIsAddingPhone(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        onClick={() => setIsAddingPhone(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Phone Recipient
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default NotificationSettings
