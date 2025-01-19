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
  MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/utils/trpc'

const paymentSettingsSchema = z.object({
  stripeSecretKey: z.string().min(1, 'Stripe secret key is required'),
  stripePublicKey: z.string().min(1, 'Stripe public key is required'),
  currency: z.string().min(1, 'Currency is required'),
  enableTestMode: z.boolean(),
  minimumPaymentAmount: z.number().min(0),
  paymentMethods: z.array(z.string()),
})

type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>

const currencies = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
]

const PaymentSettings: React.FC = () => {
  const utils = trpc.useContext()

  const { data: settings } = trpc.admin.settings.getPayment.useQuery()

  const updateSettingsMutation = trpc.admin.settings.updatePayment.useMutation({
    onSuccess: () => {
      utils.admin.settings.getPayment.invalidate()
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: settings || {
      stripeSecretKey: '',
      stripePublicKey: '',
      currency: 'USD',
      enableTestMode: false,
      minimumPaymentAmount: 0,
      paymentMethods: ['card'],
    },
  })

  const onSubmit = (data: PaymentSettingsFormData) => {
    updateSettingsMutation.mutate(data)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Settings
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stripe Secret Key"
                  {...register('stripeSecretKey')}
                  error={!!errors.stripeSecretKey}
                  helperText={errors.stripeSecretKey?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stripe Public Key"
                  {...register('stripePublicKey')}
                  error={!!errors.stripePublicKey}
                  helperText={errors.stripePublicKey?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Currency"
                  {...register('currency')}
                  error={!!errors.currency}
                  helperText={errors.currency?.message}
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Payment Amount"
                  {...register('minimumPaymentAmount', { valueAsNumber: true })}
                  error={!!errors.minimumPaymentAmount}
                  helperText={errors.minimumPaymentAmount?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="enableTestMode"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Enable Test Mode"
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

export default PaymentSettings
