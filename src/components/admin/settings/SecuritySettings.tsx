import React from 'react'
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/utils/trpc'

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  passwordMinLength: z.number().min(8).max(32),
  sessionTimeout: z.number().min(5).max(1440),
  maxLoginAttempts: z.number().min(3).max(10),
})

type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>

const SecuritySettings: React.FC = () => {
  const utils = trpc.useContext()

  const { data: settings } = trpc.admin.settings.getSecurity.useQuery()

  const updateSettingsMutation = trpc.admin.settings.updateSecurity.useMutation({
    onSuccess: () => {
      utils.admin.settings.getSecurity.invalidate()
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings || {
      twoFactorEnabled: false,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
  })

  const onSubmit = (data: SecuritySettingsFormData) => {
    updateSettingsMutation.mutate(data)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="twoFactorEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Enable Two-Factor Authentication"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Password Length"
                  {...register('passwordMinLength', { valueAsNumber: true })}
                  error={!!errors.passwordMinLength}
                  helperText={errors.passwordMinLength?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Session Timeout (minutes)"
                  {...register('sessionTimeout', { valueAsNumber: true })}
                  error={!!errors.sessionTimeout}
                  helperText={errors.sessionTimeout?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Login Attempts"
                  {...register('maxLoginAttempts', { valueAsNumber: true })}
                  error={!!errors.maxLoginAttempts}
                  helperText={errors.maxLoginAttempts?.message}
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

export default SecuritySettings
