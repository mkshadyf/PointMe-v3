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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import userService from '../../services/userService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { supabase } from '../../lib/supabase'

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = React.useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useQuery(
    ['profile', user?.id],
    () => userService.getProfile(user!.id),
    {
      enabled: !!user,
    }
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  })

  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      })
    }
  }, [profile, reset])

  const updateProfileMutation = useMutation(
    (data: ProfileFormData) => userService.updateProfile(user!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', user?.id])
        showNotification('Profile updated successfully', 'success')
        setIsEditing(false)
      },
      onError: () => {
        showNotification('Failed to update profile', 'error')
      },
    }
  )

  const updateAvatarMutation = useMutation(
    async (file: File) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: updateError } = await userService.updateAvatar(
        user!.id,
        filePath
      )

      if (updateError) throw updateError

      return filePath
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', user?.id])
        showNotification('Avatar updated successfully', 'success')
      },
      onError: () => {
        showNotification('Failed to update avatar', 'error')
      },
    }
  )

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      updateAvatarMutation.mutate(file)
    }
  }

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
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
            Please sign in to view your profile
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Box display="flex" alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profile?.avatarUrl}
                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                  onClick={handleAvatarClick}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                  }}
                  onClick={handleAvatarClick}
                >
                  <PhotoCameraIcon />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Box>
              <Box ml={3}>
                <Typography variant="h6">{profile?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since{' '}
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
                      fullWidth
                      disabled={!isEditing}
                      error={!!errors.name}
                      helperText={errors.name?.message}
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
                      disabled={!isEditing}
                      error={!!errors.email}
                      helperText={errors.email?.message}
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
                      disabled={!isEditing}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      fullWidth
                      disabled={!isEditing}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isDirty}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </form>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            onClick={() => setChangePasswordOpen(true)}
          >
            Change Password
          </Button>
        </Paper>
      </Box>

      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            An email will be sent to you with instructions to reset your
            password.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await userService.requestPasswordReset(user.email)
                showNotification(
                  'Password reset email sent successfully',
                  'success'
                )
                setChangePasswordOpen(false)
              } catch (error) {
                showNotification(
                  'Failed to send password reset email',
                  'error'
                )
              }
            }}
          >
            Send Reset Email
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Profile

