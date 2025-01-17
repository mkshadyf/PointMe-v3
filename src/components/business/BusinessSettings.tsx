import React from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material'
import { useQuery } from 'react-query'
import { useAuthStore } from '../../stores/authStore'
import businessService from '../../services/businessService'
import BusinessProfile from './settings/BusinessProfile'
import BusinessHoursSettings from './settings/BusinessHoursSettings'
import ServiceSettings from './settings/ServiceSettings'
import PaymentSettings from './settings/PaymentSettings'
import NotificationSettings from './settings/NotificationSettings'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const BusinessSettings: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)
  const { user } = useAuthStore()

  const { data: business, isLoading } = useQuery(
    ['business', user?.id],
    () => businessService.getBusinessByOwnerId(user!.id),
    {
      enabled: !!user,
    }
  )

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!business) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="text.secondary">
          Business not found
        </Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Business Settings
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="business settings tabs"
              >
                <Tab label="Profile" />
                <Tab label="Business Hours" />
                <Tab label="Services" />
                <Tab label="Payments" />
                <Tab label="Notifications" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <BusinessProfile business={business} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <BusinessHoursSettings businessId={business.id} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ServiceSettings businessId={business.id} />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <PaymentSettings businessId={business.id} />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <NotificationSettings businessId={business.id} />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default BusinessSettings

