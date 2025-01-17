import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import { useAuth } from '../../lib/auth/AuthProvider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Appointments() {
  const [tabValue, setTabValue] = useState(0);
  const { userRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {userRole === 'business'
            ? 'Appointment Management'
            : 'My Appointments'}
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="appointment views"
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab label="List View" />
            <Tab label="Calendar View" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <AppointmentList />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <AppointmentCalendar />
        </TabPanel>
      </Paper>
    </Container>
  );
}
