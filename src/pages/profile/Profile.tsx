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
import { useAuth } from '../../lib/auth/AuthProvider';
import PersonalInfo from '../../components/profile/PersonalInfo';
import SecuritySettings from '../../components/profile/SecuritySettings';
import NotificationPreferences from '../../components/profile/NotificationPreferences';
import PaymentMethods from '../../components/profile/PaymentMethods';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Profile Settings
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile settings tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : undefined}
          >
            <Tab label="Personal Info" />
            <Tab label="Security" />
            <Tab label="Notifications" />
            <Tab label="Payment Methods" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <PersonalInfo user={user} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SecuritySettings />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <NotificationPreferences />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <PaymentMethods />
        </TabPanel>
      </Paper>
    </Container>
  );
}
