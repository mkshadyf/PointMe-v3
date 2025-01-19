import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/utils/trpc'

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string(),
  contactEmail: z.string().email('Invalid email address'),
  supportPhone: z.string(),
})

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

const GeneralSettings: React.FC = () => {
  const utils = trpc.useContext()

  const { data: settings } = trpc.admin.settings.getGeneral.useQuery()

  const updateSettingsMutation = trpc.admin.settings.updateGeneral.useMutation({
    onSuccess: () => {
      utils.admin.settings.getGeneral.invalidate()
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings || {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportPhone: '',
    },
  })

  const onSubmit = (data: GeneralSettingsFormData) => {
    updateSettingsMutation.mutate(data)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        General Settings
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  {...register('siteName')}
                  error={!!errors.siteName}
                  helperText={errors.siteName?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Site Description"
                  {...register('siteDescription')}
                  error={!!errors.siteDescription}
                  helperText={errors.siteDescription?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  {...register('contactEmail')}
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Phone"
                  {...register('supportPhone')}
                  error={!!errors.supportPhone}
                  helperText={errors.supportPhone?.message}
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

export default GeneralSettings
