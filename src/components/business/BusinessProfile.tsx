import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Card,
  CardContent,
  IconButton,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Edit as EditIcon, Upload as UploadIcon } from '@mui/icons-material'
import { useAuthStore } from '@/stores/authStore'
import { businessService } from '@/services/businessService'
import { useNotification } from '@/contexts/NotificationContext'
import { Business } from '@/types/business'
import { Loader } from '@googlemaps/js-api-loader'
import { useSupabase } from '@/contexts/SupabaseContext'

interface BusinessProfileProps {
  business: Business;
  onUpdate?: (business: Business) => void;
}

export default function BusinessProfile({ business, onUpdate }: BusinessProfileProps) {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<Business>({
    defaultValues: business,
  })

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
      })

      const google = await loader.load()
      const position = business.latitude && business.longitude
        ? { lat: business.latitude, lng: business.longitude }
        : { lat: 0, lng: 0 }

      const mapInstance = new google.maps.Map(document.getElementById('map')!, {
        center: position,
        zoom: 15,
      })

      const markerInstance = new google.maps.Marker({
        position,
        map: mapInstance,
        draggable: true,
      })

      setMap(mapInstance)
      setMarker(markerInstance)

      google.maps.event.addListener(markerInstance, 'dragend', function(event: google.maps.MapMouseEvent) {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          // Update form values
          // You'll need to implement this part based on your form state management
        }
      })
    }

    if (typeof window !== 'undefined') {
      initMap()
    }
  }, [business])

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      setIsLoading(true)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(`${business.id}/${type}/${file.name}`, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(uploadData.path)

      await businessService.updateBusinessImage(business.id, {
        [`${type}Url`]: publicUrl,
      })

      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`, 'success')
      onUpdate?.({ ...business, [`${type}Url`]: publicUrl })
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error)
      showNotification(`Failed to upload ${type}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: Business) => {
    try {
      setIsLoading(true)
      const updatedBusiness = await businessService.updateBusiness(business.id, {
        ...data,
        latitude: marker?.getPosition()?.lat(),
        longitude: marker?.getPosition()?.lng(),
      })
      showNotification('Business profile updated successfully', 'success')
      onUpdate?.(updatedBusiness)
    } catch (error) {
      console.error('Failed to update business profile:', error)
      showNotification('Failed to update business profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Business Profile
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <Box
                  sx={{
                    height: 200,
                    position: 'relative',
                    backgroundImage: `url(${business.coverUrl || '/default-cover.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cover-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'cover')
                    }}
                  />
                  <label htmlFor="cover-upload">
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: 'background.paper',
                      }}
                      component="span"
                    >
                      <UploadIcon />
                    </IconButton>
                  </label>
                </Box>

                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={business.logoUrl}
                        sx={{ width: 100, height: 100, mr: 2 }}
                      />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'logo')
                        }}
                      />
                      <label htmlFor="logo-upload">
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 16,
                            bgcolor: 'background.paper',
                          }}
                          component="span"
                        >
                          <EditIcon />
                        </IconButton>
                      </label>
                    </Box>
                    <Box>
                      <Typography variant="h6">{business.name}</Typography>
                      <Typography color="text.secondary">
                        {business.category}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('name')}
                        fullWidth
                        label="Business Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('email')}
                        fullWidth
                        label="Business Email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('phone')}
                        fullWidth
                        label="Business Phone"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('address')}
                        fullWidth
                        label="Business Address"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('description')}
                        fullWidth
                        multiline
                        rows={4}
                        label="Business Description"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Box
                  id="map"
                  sx={{ width: '100%', height: 400, borderRadius: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                >
                  Save Changes
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  )
}
