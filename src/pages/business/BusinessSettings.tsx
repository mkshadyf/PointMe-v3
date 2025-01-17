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
import BusinessHoursSettings from '../../components/business/settings/BusinessHoursSettings';
import ServiceSettings from '../../components/business/settings/ServiceSettings';
import StaffManagement from '../../components/business/StaffManagement';
import PaymentSettings from '../../components/business/settings/PaymentSettings';
import NotificationSettings from '../../components/business/settings/NotificationSettings';

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
      id={`business-settings-tabpanel-${index}`}
      aria-labelledby={`business-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BusinessSettings() {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Business Settings
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="business settings tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : undefined}
          >
            <Tab label="Working Hours" />
            <Tab label="Services" />
            <Tab label="Staff" />
            <Tab label="Payment" />
            <Tab label="Notifications" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <BusinessHoursSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ServiceSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <StaffManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <PaymentSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <NotificationSettings />
        </TabPanel>
      </Paper>
    </Container>
  );
}
