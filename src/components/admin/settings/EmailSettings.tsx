import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/utils/trpc'

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().min(1).max(65535),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  enableSSL: z.boolean(),
})

type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>

const EmailSettings: React.FC = () => {
  const utils = trpc.useContext()

  const { data: settings } = trpc.admin.settings.getEmail.useQuery()

  const updateSettingsMutation = trpc.admin.settings.updateEmail.useMutation({
    onSuccess: () => {
      utils.admin.settings.getEmail.invalidate()
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: settings || {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableSSL: true,
    },
  })

  const onSubmit = (data: EmailSettingsFormData) => {
    updateSettingsMutation.mutate(data)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Email Settings
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  {...register('smtpHost')}
                  error={!!errors.smtpHost}
                  helperText={errors.smtpHost?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="SMTP Port"
                  {...register('smtpPort', { valueAsNumber: true })}
                  error={!!errors.smtpPort}
                  helperText={errors.smtpPort?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  {...register('smtpUser')}
                  error={!!errors.smtpUser}
                  helperText={errors.smtpUser?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="SMTP Password"
                  {...register('smtpPassword')}
                  error={!!errors.smtpPassword}
                  helperText={errors.smtpPassword?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  {...register('fromEmail')}
                  error={!!errors.fromEmail}
                  helperText={errors.fromEmail?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  {...register('fromName')}
                  error={!!errors.fromName}
                  helperText={errors.fromName?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="enableSSL"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Enable SSL/TLS"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={updateSettingsMutation.isLoading}
                >
                  {updateSettingsMutation.isLoading
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default EmailSettings
