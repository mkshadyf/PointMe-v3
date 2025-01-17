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
import GeneralSettings from '../../components/admin/settings/GeneralSettings';
import SecuritySettings from '../../components/admin/settings/SecuritySettings';
import EmailSettings from '../../components/admin/settings/EmailSettings';
import PaymentSettings from '../../components/admin/settings/PaymentSettings';
import IntegrationSettings from '../../components/admin/settings/IntegrationSettings';

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
      id={`admin-settings-tabpanel-${index}`}
      aria-labelledby={`admin-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminSettings() {
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
          Admin Settings
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin settings tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : undefined}
          >
            <Tab label="General" />
            <Tab label="Security" />
            <Tab label="Email" />
            <Tab label="Payment" />
            <Tab label="Integrations" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <GeneralSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SecuritySettings />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <EmailSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <PaymentSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <IntegrationSettings />
        </TabPanel>
      </Paper>
    </Container>
  );
}
