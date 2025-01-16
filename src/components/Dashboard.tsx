import React, { useState } from 'react';
import { Container, Typography, Paper, Button, Box, Tabs, Tab, AppBar, Toolbar } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import BusinessManagement from './BusinessManagement';
import ServiceManagement from './ServiceManagement';
import BookingManagement from './BookingManagement';
import BookingCalendar from './BookingCalendar';
import AnalyticsDashboard from './AnalyticsDashboard';
import Messaging from './Messaging';
import RoleBasedAccess from './RoleBasedAccess';
import NotificationCenter from './NotificationCenter';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PointMe
          </Typography>
          <NotificationCenter />
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, mt: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography component="h1" variant="h4">
              Welcome, {user.name}!
            </Typography>
          </Box>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
              <Tab label="Businesses" />
            </RoleBasedAccess>
            <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
              <Tab label="Services" />
            </RoleBasedAccess>
            <Tab label="Bookings" />
            <Tab label="Calendar" />
            <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
              <Tab label="Analytics" />
            </RoleBasedAccess>
            <Tab label="Messages" />
          </Tabs>
          <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
            <TabPanel value={tabValue} index={0}>
              <BusinessManagement onSelectBusiness={setSelectedBusinessId} />
            </TabPanel>
          </RoleBasedAccess>
          <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
            <TabPanel value={tabValue} index={1}>
              {selectedBusinessId ? (
                <ServiceManagement businessId={selectedBusinessId} />
              ) : (
                <Typography>Please select a business first</Typography>
              )}
            </TabPanel>
          </RoleBasedAccess>
          <TabPanel value={tabValue} index={2}>
            <BookingManagement />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <BookingCalendar />
          </TabPanel>
          <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
            <TabPanel value={tabValue} index={4}>
              {selectedBusinessId ? (
                <AnalyticsDashboard businessId={selectedBusinessId} />
              ) : (
                <Typography>Please select a business first</Typography>
              )}
            </TabPanel>
          </RoleBasedAccess>
          <TabPanel value={tabValue} index={5}>
            <Messaging />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;

