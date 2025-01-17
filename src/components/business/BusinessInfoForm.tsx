import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material'

const businessInfoSchema = z.object({
  name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
})

type BusinessInfoData = z.infer<typeof businessInfoSchema>

interface BusinessInfoFormProps {
  initialData: BusinessInfoData
  onSubmit: (data: BusinessInfoData) => void
}

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: initialData,
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" gutterBottom>
        Tell us about your business
      </Typography>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            label="Business Name"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            label="Business Description"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={isSubmitting}
      >
        Continue
      </Button>
    </Box>
  )
}

export default BusinessInfoForm
