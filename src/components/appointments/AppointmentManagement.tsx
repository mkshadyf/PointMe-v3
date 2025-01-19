import React, { useState } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddIcon from '@mui/icons-material/Add';
import useSWR from 'swr'
import { appointmentService } from '@/services/appointmentService'
import type { Appointment } from '../../types/appointment'
import { useAuthStore } from '../../stores/authStore'
import AppointmentCalendar from './AppointmentCalendar'
import AppointmentList from './AppointmentList'
import CreateAppointmentDialog from './CreateAppointmentDialog'
import { format } from 'date-fns'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`appointment-tabpanel-${index}`}
    aria-labelledby={`appointment-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const AppointmentManagement: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const { user, business } = useAuthStore()

  const filters = {
    businessId: business?.id,
    date: format(selectedDate, 'yyyy-MM-dd'),
    query: searchQuery,
  }

  const { data: appointments, error, isLoading } = useSWR(
    ['appointments', selectedDate],
    () => appointmentService.getAppointments({ startDate: selectedDate })
  )

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h4" component="h1">
                Appointments
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                New Appointment
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="appointment view tabs"
              >
                <Tab
                  icon={<CalendarMonthIcon />}
                  iconPosition="start"
                  label="Calendar"
                />
                <Tab
                  icon={<ListAltIcon />}
                  iconPosition="start"
                  label="List"
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <AppointmentCalendar
                appointments={appointments || []}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                isLoading={isLoading}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <AppointmentList 
                businessId={business.id}
                appointments={appointments || []}
                isLoading={isLoading}
              />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <CreateAppointmentDialog
        businessId={business.id}
        staffId={business.id}
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        selectedDate={selectedDate}
      />
    </Container>
  )
}

export default AppointmentManagement
