import React from 'react'
import {
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from 'react-query'
import businessService from '../../../services/businessService'
import { Business } from '../../../types/business'
import PhotoCamera from '@mui/icons-material/PhotoCamera'

const businessProfileSchema = z.object({
  name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  email: z.string()
    .email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number must be less than 15 characters'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
})

type BusinessProfileData = z.infer<typeof businessProfileSchema>

interface BusinessProfileProps {
  business: Business
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ business }) => {
  const queryClient = useQueryClient()
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BusinessProfileData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: business.name,
      description: business.description,
      email: business.email || '',
      phone: business.phone || '',
      address: business.address || '',
      website: business.website || '',
    },
  })

  const updateMutation = useMutation(
    (data: BusinessProfileData) => businessService.updateBusiness(business.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['business', business.id])
        // Show success notification
      },
    }
  )

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0])
    }
  }

  const onSubmit = async (data: BusinessProfileData) => {
    try {
      await updateMutation.mutateAsync(data)

      if (logoFile) {
        // TODO: Implement logo upload
        console.log('Upload logo:', logoFile)
      }
    } catch (error) {
      console.error('Failed to update business profile:', error)
      // Show error notification
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
              >
                <Avatar
                  src={business.logoUrl}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                />
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Logo
                </Button>
                {logoFile && (
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Selected: {logoFile.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Business Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Business Description"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Business Address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Website (Optional)"
                        error={!!errors.website}
                        helperText={errors.website?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isDirty || isSubmitting}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default BusinessProfile
