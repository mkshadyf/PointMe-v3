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
import Analytics from '../../components/admin/Analytics';
import BusinessApproval from '../../components/admin/BusinessApproval';
import UserManagement from '../../components/admin/UserManagement';
import ContentModeration from '../../components/admin/ContentModeration';
import Categories from '../../components/admin/Categories';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
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
          Admin Dashboard
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin dashboard tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : undefined}
          >
            <Tab label="Analytics" />
            <Tab label="Business Approval" />
            <Tab label="User Management" />
            <Tab label="Content Moderation" />
            <Tab label="Categories" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Analytics />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BusinessApproval />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UserManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <ContentModeration />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Categories />
        </TabPanel>
      </Paper>
    </Container>
  );
}
