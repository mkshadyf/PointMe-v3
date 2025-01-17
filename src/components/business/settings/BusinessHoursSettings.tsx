import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import businessService from '../../../services/businessService'; 
import { WorkingHours, DayOfWeek, DaySchedule, TimeSlot } from '../../../types/business';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface BusinessHoursSettingsProps {
  businessId: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const BusinessHoursSettings: React.FC<BusinessHoursSettingsProps> = ({ businessId }) => {
  const queryClient = useQueryClient();

  const { data: workingHours, isLoading } = useQuery(
    ['workingHours', businessId],
    () => businessService.getWorkingHours(businessId)
  );

  const updateWorkingHoursMutation = useMutation(
    (hours: Business['workingHours']) => businessService.updateWorkingHours(businessId, hours),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['workingHours', businessId]);
      },
    }
  );

  const handleUpdateWorkingHours = async (updatedHours: Business['workingHours']) => {
    try {
      await updateWorkingHoursMutation.mutateAsync(updatedHours);
    } catch (error) {
      console.error('Failed to update working hours:', error);
    }
  };

  const getInitialWorkingHours = (): WorkingHours => {
    return DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: false,
        timeSlots: [],
        breaks: [],
      },
    }), {} as WorkingHours);
  };

  const [workingHoursState, setWorkingHours] = useState<WorkingHours>(
    workingHours || getInitialWorkingHours()
  );

  const handleDayToggle = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleAddTimeSlot = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [
          ...prev[day].timeSlots,
          { start: '09:00', end: '17:00' },
        ],
      },
    }));
  };

  const handleRemoveTimeSlot = (day: DayOfWeek, index: number) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index),
      },
    }));
  };

  const handleTimeSlotChange = (
    day: DayOfWeek,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleSave = () => {
    handleUpdateWorkingHours(workingHoursState);
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Business Hours
        </Typography>
        <Grid container spacing={2}>
          {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12} key={day}>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography sx={{ width: 100, textTransform: 'capitalize' }}>
                  {day}
                </Typography>
                <Switch
                  checked={workingHoursState[day].isOpen}
                  onChange={() => handleDayToggle(day)}
                />
                {workingHoursState[day].isOpen && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddTimeSlot(day)}
                    sx={{ ml: 2 }}
                  >
                    Add Hours
                  </Button>
                )}
              </Box>
              {workingHoursState[day].isOpen &&
                workingHoursState[day].timeSlots.map((slot: TimeSlot, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    mb={1}
                    ml={4}
                  >
                    <FormControl size="small" sx={{ width: 120, mr: 2 }}>
                      <Select
                        value={slot.start}
                        onChange={(e) =>
                          handleTimeSlotChange(
                            day,
                            index,
                            'start',
                            e.target.value as string
                          )
                        }
                      >
                        {TIME_OPTIONS.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Open</FormHelperText>
                    </FormControl>
                    <FormControl size="small" sx={{ width: 120, mr: 2 }}>
                      <Select
                        value={slot.end}
                        onChange={(e) =>
                          handleTimeSlotChange(
                            day,
                            index,
                            'end',
                            e.target.value as string
                          )
                        }
                      >
                        {TIME_OPTIONS.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Close</FormHelperText>
                    </FormControl>
                    <IconButton
                      onClick={() => handleRemoveTimeSlot(day, index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
            </Grid>
          ))}
        </Grid>
        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursSettings;
