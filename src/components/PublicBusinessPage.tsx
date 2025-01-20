import { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack, 
  Tabs,
  Tab,
  Rating 
} from '@mui/material'
import { useParams } from '@tanstack/react-router'
import { trpc } from '../utils/trpc'
import BusinessReviews from './BusinessReviews'
import ServiceSearch from './ServiceSearch'
import BookingManagement from './BookingManagement'
import useAuthStore from '../stores/authStore'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`business-tabpanel-${index}`}
      aria-labelledby={`business-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `business-tab-${index}`,
    'aria-controls': `business-tabpanel-${index}`,
  }
}

export default function PublicBusinessPage() {
  const [tabValue, setTabValue] = useState(0)
  const { businessId } = useParams({ from: '/business/:businessId' })
  const { user } = useAuthStore()

  const { data: business } = trpc.business.get.useQuery({
    id: businessId
  })

  const { data: stats } = trpc.business.getBusinessStats.useQuery({
    businessId
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (!business) {
    return (
      <Typography>
        Business not found
      </Typography>
    )
  }

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        {business.coverImage && (
          <CardMedia
            component="img"
            height="200"
            image={business.coverImage}
            alt={business.name}
          />
        )}
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {business.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {business.description}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {business.categories.map((category: string) => (
                  <Chip key={category} label={category} size="small" />
                ))}
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2">
                  Address: {business.address}
                </Typography>
                <Typography variant="body2">
                  Phone: {business.phone}
                </Typography>
                <Typography variant="body2">
                  Email: {business.email}
                </Typography>
                {business.website && (
                  <Typography variant="body2">
                    Website: <a href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a>
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Business Stats
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={stats?.averageRating || 0} readOnly precision={0.1} />
                        <Typography>
                          ({stats?.totalReviews || 0} reviews)
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Services
                      </Typography>
                      <Typography variant="h6">
                        {stats?.totalServices || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Bookings
                      </Typography>
                      <Typography variant="h6">
                        {stats?.totalBookings || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="business tabs">
          <Tab label="Services" {...a11yProps(0)} />
          <Tab label="Reviews" {...a11yProps(1)} />
          {user && <Tab label="Bookings" {...a11yProps(2)} />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ServiceSearch onSearch={() => {}} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BusinessReviews businessId={businessId} />
      </TabPanel>

      {user && (
        <TabPanel value={tabValue} index={2}>
          <BookingManagement serviceId={business.id} businessId={businessId} />
        </TabPanel>
      )}
    </Box>
  )
}
