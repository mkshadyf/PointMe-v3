import React from 'react'
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Button,
  Chip,
  Alert,
} from '@mui/material'
import useSWR from 'swr'
import { businessService } from '@/services/businessService'
import { WorkingHours } from '@/types/business'

interface BusinessHoursProps {
  businessId: string;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type DayOfWeek = typeof DAYS[number];

interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export default function BusinessHours({ businessId }: BusinessHoursProps) {
  const { data: workingHours, error, isLoading } = useSWR<WorkingHours>(
    businessId ? ['workingHours', businessId] : null,
    () => businessService.getWorkingHours(businessId)
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load business hours. Please try again later.
      </Alert>
    )
  }

  if (!workingHours) {
    return null
  }

  const schedule: DaySchedule[] = DAYS.map(day => ({
    day,
    isOpen: workingHours[day.toLowerCase()]?.isOpen ?? false,
    openTime: workingHours[day.toLowerCase()]?.openTime ?? null,
    closeTime: workingHours[day.toLowerCase()]?.closeTime ?? null,
  }))

  return (
    <List disablePadding>
      {schedule.map(({ day, isOpen, openTime, closeTime }) => (
        <ListItem
          key={day}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <ListItemText
            primary={day}
            secondary={
              isOpen && openTime && closeTime ? (
                <Typography variant="body2" color="text.secondary">
                  {openTime} - {closeTime}
                </Typography>
              ) : (
                <Chip
                  label="Closed"
                  size="small"
                  color="default"
                  sx={{ mt: 0.5 }}
                />
              )
            }
          />
        </ListItem>
      ))}
    </List>
  )
}
