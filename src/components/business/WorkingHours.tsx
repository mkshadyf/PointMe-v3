import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR, { mutate } from 'swr'
import { businessService } from '@/services/businessService'
import { useAuthStore } from '@/stores/authStore'
import { useNotification } from '@/contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { DayOfWeek } from '@/types/business'

const timeSlotSchema = z.object({
  start: z.string().min(1, 'Start time is required'),
  end: z.string().min(1, 'End time is required'),
}).refine(data => {
  const start = new Date(`1970-01-01T${data.start}`)
  const end = new Date(`1970-01-01T${data.end}`)
  return end > start
}, { message: 'End time must be after start time' })

const breakSchema = z.object({
  start: z.string().min(1, 'Start time is required'),
  end: z.string().min(1, 'End time is required'),
  description: z.string().optional(),
}).refine(data => {
  const start = new Date(`1970-01-01T${data.start}`)
  const end = new Date(`1970-01-01T${data.end}`)
  return end > start
}, { message: 'Break end time must be after start time' })

const dayScheduleSchema = z.object({
  isOpen: z.boolean(),
  timeSlots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
  breaks: z.array(breakSchema).optional(),
})

const workingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
  holidays: z.array(
    z.object({
      date: z.string().min(1, 'Date is required'),
      description: z.string().optional(),
    })
  ),
  specialHours: z.array(
    z.object({
      date: z.string().min(1, 'Date is required'),
      timeSlots: z.array(timeSlotSchema).min(1, 'At least one time slot is required'),
      description: z.string().optional(),
    })
  ),
})

type WorkingHoursFormData = z.infer<typeof workingHoursSchema>

interface WorkingHoursProps {
  businessId: string;
  workingHours: WorkingHoursFormData;
  onSave: (workingHours: WorkingHoursFormData) => Promise<void>;
  isLoading?: boolean;
}

const defaultTimeSlot = {
  start: '09:00',
  end: '17:00',
}

const defaultDaySchedule = {
  isOpen: false,
  timeSlots: [defaultTimeSlot],
  breaks: [],
}

const defaultWorkingHours: WorkingHoursFormData = {
  monday: defaultDaySchedule,
  tuesday: defaultDaySchedule,
  wednesday: defaultDaySchedule,
  thursday: defaultDaySchedule,
  friday: defaultDaySchedule,
  saturday: defaultDaySchedule,
  sunday: defaultDaySchedule,
  holidays: [],
  specialHours: []
}

export default function WorkingHours({ 
  businessId, 
  workingHours = defaultWorkingHours,
  onSave,
  isLoading = false 
}: WorkingHoursProps) {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null)
  const [breakDialogOpen, setBreakDialogOpen] = useState(false)
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [specialHoursDialogOpen, setSpecialHoursDialogOpen] = useState(false)

  const { data: workingHoursData, error: workingHoursError } = useSWR(
    user?.id ? ['workingHours', user.id] : null,
    () => businessService.getWorkingHours(user!.id)
  )

  const { 
    register, 
    control, 
    handleSubmit, 
    watch, 
    reset,
    formState: { errors, isDirty }
  } = useForm<WorkingHoursFormData>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: workingHours,
    mode: 'onChange'
  })

  const holidaysArray = useFieldArray({
    control,
    name: 'holidays',
  })

  const specialHoursArray = useFieldArray({
    control,
    name: 'specialHours',
  })

  React.useEffect(() => {
    if (workingHoursData) {
      reset(workingHoursData)
    }
  }, [workingHoursData, reset])

  const handleSave = async (data: WorkingHoursFormData) => {
    try {
      await onSave(data)
      await mutate(['workingHours', user?.id])
      showNotification('Working hours updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update working hours:', error)
      showNotification('Failed to update working hours', 'error')
    }
  }

  const handleAddBreak = (day: DayOfWeek) => {
    setSelectedDay(day)
    setBreakDialogOpen(true)
  }

  interface DayScheduleProps {
    day: DayOfWeek;
    control: any;
    errors: any;
    watch: any;
  }

  const DaySchedule: React.FC<DayScheduleProps> = ({ day, control, errors, watch }) => {
    const isOpen = watch(`${day}.isOpen`)
    const dayErrors = errors?.[day]

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Typography>
            <Controller
              name={`${day}.isOpen`}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={field.value ? 'Open' : 'Closed'}
                />
              )}
            />
          </Box>

          {dayErrors && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dayErrors.message}
            </Alert>
          )}

          {isOpen && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Business Hours
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <Controller
                    name={`${day}.timeSlots.0.start`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="time"
                        fullWidth
                        label="Open"
                        error={!!dayErrors?.timeSlots?.[0]?.start}
                        helperText={dayErrors?.timeSlots?.[0]?.start?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Controller
                    name={`${day}.timeSlots.0.end`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="time"
                        fullWidth
                        label="Close"
                        error={!!dayErrors?.timeSlots?.[0]?.end}
                        helperText={dayErrors?.timeSlots?.[0]?.end?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    color="primary"
                    onClick={() => handleAddBreak(day)}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Breaks
                </Typography>
                {watch(`${day}.breaks`)?.map((breakItem: any, index: number) => (
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    key={index}
                    sx={{ mb: 1 }}
                  >
                    <Grid item xs={4}>
                      <Controller
                        name={`${day}.breaks.${index}.start`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="time"
                            fullWidth
                            label="Start"
                            size="small"
                            error={!!dayErrors?.breaks?.[index]?.start}
                            helperText={dayErrors?.breaks?.[index]?.start?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Controller
                        name={`${day}.breaks.${index}.end`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="time"
                            fullWidth
                            label="End"
                            size="small"
                            error={!!dayErrors?.breaks?.[index]?.end}
                            helperText={dayErrors?.breaks?.[index]?.end?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controller
                        name={`${day}.breaks.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Description"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const breaks = [...watch(`${day}.breaks`)]
                          breaks.splice(index, 1)
                          reset({
                            ...watch(),
                            [day]: {
                              ...watch(day),
                              breaks,
                            },
                          })
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    )
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
            Please sign in to manage working hours
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Working Hours
        </Typography>

        <form onSubmit={handleSubmit(handleSave)}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Regular Hours
            </Typography>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
              (day) => (
                <DaySchedule
                  key={day}
                  day={day}
                  control={control}
                  errors={errors}
                  watch={watch}
                />
              )
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Holidays</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setHolidayDialogOpen(true)}
              >
                Add Holiday
              </Button>
            </Box>
            <Grid container spacing={2}>
              {holidaysArray.fields.map((field, index) => (
                <Grid item xs={12} sm={6} md={4} key={field.id}>
                  <Card>
                    <CardContent>
                      <Controller
                        name={`holidays.${index}.date`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            fullWidth
                            label="Date"
                            sx={{ mb: 2 }}
                            error={!!errors?.holidays?.[index]?.date}
                            helperText={errors?.holidays?.[index]?.date?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`holidays.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Description"
                          />
                        )}
                      />
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <IconButton
                          color="error"
                          onClick={() => holidaysArray.remove(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Special Hours</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setSpecialHoursDialogOpen(true)}
              >
                Add Special Hours
              </Button>
            </Box>
            <Grid container spacing={2}>
              {specialHoursArray.fields.map((field, index) => (
                <Grid item xs={12} sm={6} md={4} key={field.id}>
                  <Card>
                    <CardContent>
                      <Controller
                        name={`specialHours.${index}.date`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            fullWidth
                            label="Date"
                            sx={{ mb: 2 }}
                            error={!!errors?.specialHours?.[index]?.date}
                            helperText={errors?.specialHours?.[index]?.date?.message}
                          />
                        )}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Controller
                            name={`specialHours.${index}.timeSlots.0.start`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="time"
                                fullWidth
                                label="Open"
                                error={!!errors?.specialHours?.[index]?.timeSlots?.[0]?.start}
                                helperText={errors?.specialHours?.[index]?.timeSlots?.[0]?.start?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Controller
                            name={`specialHours.${index}.timeSlots.0.end`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="time"
                                fullWidth
                                label="Close"
                                error={!!errors?.specialHours?.[index]?.timeSlots?.[0]?.end}
                                helperText={errors?.specialHours?.[index]?.timeSlots?.[0]?.end?.message}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Controller
                        name={`specialHours.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Description"
                            sx={{ mt: 2 }}
                          />
                        )}
                      />
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <IconButton
                          color="error"
                          onClick={() => specialHoursArray.remove(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isLoading}
              disabled={!isDirty}
            >
              Save Changes
            </LoadingButton>
          </Box>
        </form>

        <Dialog
          open={breakDialogOpen}
          onClose={() => setBreakDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Break</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Start Time"
                  onChange={(e) => {
                    if (selectedDay) {
                      const breaks = [...(watch(`${selectedDay}.breaks`) || [])]
                      breaks.push({
                        start: e.target.value,
                        end: '',
                        description: '',
                      })
                      reset({
                        ...watch(),
                        [selectedDay]: {
                          ...watch(selectedDay),
                          breaks,
                        },
                      })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="End Time"
                  onChange={(e) => {
                    if (selectedDay) {
                      const breaks = [...watch(`${selectedDay}.breaks`)]
                      const lastBreak = breaks[breaks.length - 1]
                      if (lastBreak) {
                        lastBreak.end = e.target.value
                        reset({
                          ...watch(),
                          [selectedDay]: {
                            ...watch(selectedDay),
                            breaks,
                          },
                        })
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  onChange={(e) => {
                    if (selectedDay) {
                      const breaks = [...watch(`${selectedDay}.breaks`)]
                      const lastBreak = breaks[breaks.length - 1]
                      if (lastBreak) {
                        lastBreak.description = e.target.value
                        reset({
                          ...watch(),
                          [selectedDay]: {
                            ...watch(selectedDay),
                            breaks,
                          },
                        })
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBreakDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => setBreakDialogOpen(false)}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={holidayDialogOpen}
          onClose={() => setHolidayDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Holiday</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHolidayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                holidaysArray.append({
                  date: '',
                  description: '',
                })
                setHolidayDialogOpen(false)
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={specialHoursDialogOpen}
          onClose={() => setSpecialHoursDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Special Hours</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Open"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Close"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSpecialHoursDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                specialHoursArray.append({
                  date: '',
                  timeSlots: [{ start: '', end: '' }],
                  description: '',
                })
                setSpecialHoursDialogOpen(false)
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
