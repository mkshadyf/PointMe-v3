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
} from '@mui/material'
import { useQuery } from 'react-query'

interface BusinessHour {
  day: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

interface BusinessHoursProps {
  businessId: string
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const BusinessHours: React.FC<BusinessHoursProps> = ({ businessId }) => {
  // TODO: Replace with actual API call
  const { data: hours, isLoading } = useQuery<BusinessHour[]>(
    ['businessHours', businessId],
    async () => {
      // Simulated API call
      return DAYS.map((day) => ({
        day,
        isOpen: !['Saturday', 'Sunday'].includes(day),
        openTime: !['Saturday', 'Sunday'].includes(day) ? '09:00' : undefined,
        closeTime: !['Saturday', 'Sunday'].includes(day) ? '17:00' : undefined,
      }))
    }
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <List disablePadding>
        {hours?.map((hour) => (
          <ListItem
            key={hour.day}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <ListItemText
              primary={hour.day}
              secondary={
                hour.isOpen ? (
                  <Typography variant="body2" color="text.secondary">
                    {hour.openTime} - {hour.closeTime}
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
      <Box textAlign="center" mt={2}>
        <Button variant="outlined" size="small">
          Edit Hours
        </Button>
      </Box>
    </>
  )
}

export default BusinessHours
