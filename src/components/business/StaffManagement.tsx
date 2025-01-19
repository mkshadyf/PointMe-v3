import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  FormHelperText,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import staffService from '../../services/staffService'
import serviceService from '../../services/serviceService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'

const staffSchema = z.object({
  name: z.string().min(2, 'Staff name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  role: z.string().min(1, 'Role is required'),
  services: z.array(z.string()).min(1, 'Assign at least one service'),
  isActive: z.boolean(),
  workingHours: z.object({
    monday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    tuesday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    wednesday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    thursday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    friday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    saturday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
    sunday: z.object({
      isWorking: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
})

type StaffFormData = z.infer<typeof staffSchema>

const defaultWorkingHours = {
  isWorking: false,
  start: '09:00',
  end: '17:00',
}

const StaffManagement: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: staff, error: staffError } = useSWR(
    ['staff', user?.id],
    () => staffService.getStaffMembers(user!.id)
  )

  const { data: services, error: servicesError } = useSWR(
    ['services', user?.id],
    () => serviceService.getServices(user!.id)
  )

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      services: [],
      isActive: true,
      workingHours: {
        monday: defaultWorkingHours,
        tuesday: defaultWorkingHours,
        wednesday: defaultWorkingHours,
        thursday: defaultWorkingHours,
        friday: defaultWorkingHours,
        saturday: defaultWorkingHours,
        sunday: defaultWorkingHours,
      },
    },
  })

  React.useEffect(() => {
    if (selectedStaff) {
      reset(selectedStaff)
    }
  }, [selectedStaff, reset])

  const handleCreateStaff = async (data: StaffFormData) => {
    try {
      await staffService.createStaffMember(user!.id, data)
      await mutate(['staff', user?.id])
      setIsDialogOpen(false)
      showNotification('Staff member created successfully', 'success')
    } catch (error) {
      console.error('Failed to create staff member:', error)
      showNotification('Failed to create staff member', 'error')
    }
  }

  const handleUpdateStaff = async (staffId: string, data: StaffFormData) => {
    try {
      await staffService.updateStaffMember(staffId, data)
      await mutate(['staff', user?.id])
      setSelectedStaff(null)
      showNotification('Staff member updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update staff member:', error)
      showNotification('Failed to update staff member', 'error')
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await staffService.deleteStaffMember(staffId)
      await mutate(['staff', user?.id])
      setDeleteDialogOpen(false)
      showNotification('Staff member deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete staff member:', error)
      showNotification('Failed to delete staff member', 'error')
    }
  }

  const handleOpenDialog = (staff?: any) => {
    setSelectedStaff(staff || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedStaff(null)
    setIsDialogOpen(false)
    reset()
  }

  const handleDeleteClick = (staff: any) => {
    setSelectedStaff(staff)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedStaff) {
      handleDeleteStaff(selectedStaff.id)
    }
  }

  const onSubmit = (data: StaffFormData) => {
    if (selectedStaff) {
      handleUpdateStaff(selectedStaff.id, data)
    } else {
      handleCreateStaff(data)
    }
  }

  const StaffCard: React.FC<{ staff: any }> = ({ staff }) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2 }}>{staff.name[0]}</Avatar>
            <Box>
              <Typography variant="h6">{staff.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {staff.role}
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={staff.isActive}
                onChange={(e) =>
                  handleUpdateStaff(staff.id, { ...staff, isActive: e.target.checked })
                }
              />
            }
            label={staff.isActive ? 'Active' : 'Inactive'}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <EmailIcon
              fontSize="small"
              sx={{ color: 'text.secondary', mr: 1 }}
            />
            <Typography variant="body2">{staff.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={1}>
            <PhoneIcon
              fontSize="small"
              sx={{ color: 'text.secondary', mr: 1 }}
            />
            <Typography variant="body2">{staff.phone}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Services
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {staff.services.map((service: string) => (
              <Chip
                key={service}
                label={service}
                size="small"
                sx={{ backgroundColor: 'primary.light' }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleOpenDialog(staff)}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          color="error"
          onClick={() => handleDeleteClick(staff)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  )

  const WorkingHoursField: React.FC<{
    day: string
    control: any
    errors: any
  }> = ({ day, control, errors }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {day.charAt(0).toUpperCase() + day.slice(1)}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Controller
            name={`workingHours.${day}.isWorking`}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Working"
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            name={`workingHours.${day}.start`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                fullWidth
                disabled={!watch(`workingHours.${day}.isWorking`)}
                error={!!errors?.workingHours?.[day]?.start}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            name={`workingHours.${day}.end`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                fullWidth
                disabled={!watch(`workingHours.${day}.isWorking`)}
                error={!!errors?.workingHours?.[day]?.end}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )

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
            Please sign in to manage your staff
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Staff Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Staff Member
          </Button>
        </Box>

        <Grid container spacing={3}>
          {staff?.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <StaffCard staff={member} />
            </Grid>
          ))}
        </Grid>

        {staff?.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No staff members yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by adding your first staff member
            </Typography>
          </Box>
        )}

        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Role"
                        fullWidth
                        error={!!errors.role}
                        helperText={errors.role?.message}
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
                <Grid item xs={12}>
                  <Controller
                    name="services"
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!errors.services}
                      >
                        <InputLabel>Services</InputLabel>
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
                          {services?.map((service) => (
                            <MenuItem
                              key={service.id}
                              value={service.name}
                            >
                              {service.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.services && (
                          <FormHelperText>
                            {errors.services.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Working Hours
                  </Typography>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                    (day) => (
                      <WorkingHoursField
                        key={day}
                        day={day}
                        control={control}
                        errors={errors}
                      />
                    )
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <LoadingButton
                type="submit"
                variant="contained"
              >
                {selectedStaff ? 'Update' : 'Create'}
              </LoadingButton>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Staff Member</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this staff member? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default StaffManagement
