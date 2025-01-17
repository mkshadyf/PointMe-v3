import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import businessService from '../../services/businessService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { supabase } from '../../lib/supabase'
import { LoadingButton } from '@mui/lab'
import { GoogleMap, Marker } from '@react-google-maps/api'

const businessProfileSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  website: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }),
})

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>

const steps = ['Basic Information', 'Location', 'Media & Categories']

const BusinessProfile: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = React.useState(0)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const [mapCenter, setMapCenter] = React.useState({ lat: 0, lng: 0 })
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useQuery(
    ['businessProfile', user?.id],
    () => businessService.getBusinessProfile(user!.id),
    {
      enabled: !!user,
    }
  )

  const { data: categories } = useQuery('categories', () =>
    businessService.getCategories()
  )

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      categories: [],
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
      },
    },
  })

  React.useEffect(() => {
    if (profile) {
      Object.entries(profile).forEach(([key, value]) => {
        setValue(key as keyof BusinessProfileFormData, value)
      })
      if (profile.latitude && profile.longitude) {
        setMapCenter({ lat: profile.latitude, lng: profile.longitude })
      }
    }
  }, [profile, setValue])

  const updateProfileMutation = useMutation(
    (data: BusinessProfileFormData) =>
      businessService.updateBusinessProfile(user!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['businessProfile', user?.id])
        showNotification('Profile updated successfully', 'success')
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error')
      },
    }
  )

  const uploadImageMutation = useMutation(
    async ({
      file,
      type,
    }: {
      file: File
      type: 'logo' | 'cover'
    }) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}-${type}-${Math.random()}.${fileExt}`
      const filePath = `business/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: updateError } = await businessService.updateBusinessImage(
        user!.id,
        filePath,
        type
      )

      if (updateError) throw updateError

      return filePath
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['businessProfile', user?.id])
        showNotification('Image updated successfully', 'success')
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error')
      },
    }
  )

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await businessService.uploadBusinessImage(file)
      await updateProfileMutation.mutateAsync({ imageUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      showNotification('Failed to upload image', 'error')
    }
  }

  const handleMapClick = (e: google.maps.MouseEvent) => {
    const lat = e.latLng?.lat()
    const lng = e.latLng?.lng()
    if (lat && lng) {
      setValue('latitude', lat)
      setValue('longitude', lng)
      setMapCenter({ lat, lng })
    }
  }

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const onSubmit = (data: BusinessProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Business Name"
                    fullWidth
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
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} style={{ height: '400px' }}>
              <GoogleMap
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                mapContainerStyle={{ width: '100%', height: '100%' }}
              >
                {watch('latitude') && watch('longitude') && (
                  <Marker
                    position={{
                      lat: watch('latitude')!,
                      lng: watch('longitude')!,
                    }}
                  />
                )}
              </GoogleMap>
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Logo
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profile?.logoUrl}
                    sx={{ width: 100, height: 100, cursor: 'pointer' }}
                    onClick={() => logoInputRef.current?.click()}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                    }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <input
                    type="file"
                    ref={logoInputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files![0])}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cover Image
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    backgroundColor: 'grey.200',
                    cursor: 'pointer',
                  }}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {profile?.coverUrl && (
                    <Box
                      component="img"
                      src={profile.coverUrl}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'background.paper',
                    }}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <input
                    type="file"
                    ref={coverInputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files![0])}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categories}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      {...field}
                      multiple
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {categories?.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        )
      default:
        return null
    }
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please sign in to view your business profile
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Business Profile
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isDirty}
                >
                  Next
                </Button>
              ) : (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={updateProfileMutation.isLoading}
                  disabled={!isDirty}
                >
                  Save Changes
                </LoadingButton>
              )}
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}

export default BusinessProfile

