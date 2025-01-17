import React from 'react'
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
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import businessService from '../../../services/businessService'
import { PaymentSettings as PaymentSettingsType } from '../../../types/business'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface PaymentSettingsProps {
  businessId: string
}

const paymentSettingsSchema = z.object({
  acceptOnlinePayments: z.boolean(),
  depositRequired: z.boolean(),
  depositPercentage: z.number()
    .min(0, 'Deposit percentage must be greater than or equal to 0')
    .max(100, 'Deposit percentage must be less than or equal to 100')
    .optional(),
  cancellationPolicy: z.enum(['none', 'flexible', 'moderate', 'strict']),
  cancellationFee: z.number()
    .min(0, 'Cancellation fee must be greater than or equal to 0')
    .optional(),
  currency: z.string()
    .min(1, 'Currency is required'),
  paymentMethods: z.array(z.string())
    .min(1, 'At least one payment method is required'),
})

type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  // Add more currencies as needed
]

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'cash', name: 'Cash' },
  { id: 'bank_transfer', name: 'Bank Transfer' },
  // Add more payment methods as needed
]

const CANCELLATION_POLICIES = [
  { id: 'none', name: 'No Cancellation Policy' },
  { id: 'flexible', name: 'Flexible (Full refund up to 24 hours before)' },
  { id: 'moderate', name: 'Moderate (Full refund up to 48 hours before)' },
  { id: 'strict', name: 'Strict (50% refund up to 72 hours before)' },
]

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ businessId }) => {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery(
    ['paymentSettings', businessId],
    () => businessService.getPaymentSettings(businessId)
  )

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      acceptOnlinePayments: settings?.acceptOnlinePayments || false,
      depositRequired: settings?.depositRequired || false,
      depositPercentage: settings?.depositPercentage || 0,
      cancellationPolicy: settings?.cancellationPolicy || 'none',
      cancellationFee: settings?.cancellationFee || 0,
      currency: settings?.currency || 'USD',
      paymentMethods: settings?.paymentMethods || ['cash'],
    },
  })

  const acceptOnlinePayments = watch('acceptOnlinePayments')
  const depositRequired = watch('depositRequired')
  const cancellationPolicy = watch('cancellationPolicy')

  const updatePaymentSettingsMutation = useMutation(
    (settings: Business['paymentSettings']) =>
      businessService.updatePaymentSettings(businessId, settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['paymentSettings', businessId])
      },
    }
  )

  const onSubmit = async (data: PaymentSettingsFormData) => {
    try {
      await updatePaymentSettingsMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to update payment settings:', error)
    }
  }

  if (isLoading) {
    return null // Or show loading spinner
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Online Payments
              </Typography>
              <Box mb={3}>
                <Controller
                  name="acceptOnlinePayments"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Accept Online Payments"
                    />
                  )}
                />
                {!acceptOnlinePayments && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>Online Payments Disabled</AlertTitle>
                    Enable online payments to accept credit cards and other digital
                    payment methods.
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <Box mb={3}>
                <Controller
                  name="paymentMethods"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.paymentMethods}>
                      <InputLabel>Accepted Payment Methods</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Accepted Payment Methods"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <MenuItem
                            key={method.id}
                            value={method.id}
                            disabled={
                              method.id === 'card' && !acceptOnlinePayments
                            }
                          >
                            {method.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Currency
              </Typography>
              <Box mb={3}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.currency}>
                      <InputLabel>Currency</InputLabel>
                      <Select {...field} label="Currency">
                        {CURRENCIES.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Deposits
              </Typography>
              <Box mb={3}>
                <Controller
                  name="depositRequired"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Require Deposit"
                    />
                  )}
                />
                {depositRequired && (
                  <Box mt={2}>
                    <Controller
                      name="depositPercentage"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Deposit Percentage"
                          type="number"
                          fullWidth
                          InputProps={{
                            endAdornment: '%',
                          }}
                          error={!!errors.depositPercentage}
                          helperText={errors.depositPercentage?.message}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Cancellation Policy
              </Typography>
              <Box mb={3}>
                <Controller
                  name="cancellationPolicy"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cancellationPolicy}>
                      <InputLabel>Cancellation Policy</InputLabel>
                      <Select {...field} label="Cancellation Policy">
                        {CANCELLATION_POLICIES.map((policy) => (
                          <MenuItem key={policy.id} value={policy.id}>
                            {policy.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                {cancellationPolicy !== 'none' && (
                  <Box mt={2}>
                    <Controller
                      name="cancellationFee"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Cancellation Fee"
                          type="number"
                          fullWidth
                          InputProps={{
                            startAdornment: '$',
                          }}
                          error={!!errors.cancellationFee}
                          helperText={errors.cancellationFee?.message}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>
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

export default PaymentSettings
