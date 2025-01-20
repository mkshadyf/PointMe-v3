import React from 'react';
import { Box, Typography, Paper, Container, Grid } from '@mui/material';
import RoleBasedAccess from './RoleBasedAccess';
import BusinessManagement from './BusinessManagement';
import BookingManagement from './BookingManagement';
import ServiceManagement from './ServiceManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import useAuthStore from '@/stores/authStore';

interface DashboardProps {
  selectedBusinessId: string | null;
  selectedServiceId: string | null;
  onSelectBusiness: (businessId: string | null) => void;
  setSelectedServiceId: (serviceId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedBusinessId, selectedServiceId, onSelectBusiness, setSelectedServiceId }) => {
  const { user } = useAuthStore();

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography component="h1" variant="h4">
            Welcome, {user!.email}!
          </Typography>
        </Box>
        <div className="container mx-auto px-4 py-8">
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <RoleBasedAccess roles={['business_owner', 'admin']}>
                <BusinessManagement onSelectBusiness={onSelectBusiness} />
              </RoleBasedAccess>
            </Grid>

            {selectedBusinessId && (
              <>
                <Grid item xs={12}>
                  <RoleBasedAccess roles={['business_owner', 'admin']}>
                    <ServiceManagement businessId={selectedBusinessId} />
                  </RoleBasedAccess>
                </Grid>

                <Grid item xs={12}>
                  <RoleBasedAccess roles={['business_owner', 'admin']}>
                    {selectedBusinessId && selectedServiceId && (
                      <BookingManagement businessId={selectedBusinessId} serviceId={selectedServiceId} />
                    )}
                  </RoleBasedAccess>
                </Grid>

                <Grid item xs={12}>
                  <RoleBasedAccess roles={['business_owner', 'admin']}>
                    <AnalyticsDashboard businessId={selectedBusinessId} />
                  </RoleBasedAccess>
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </Paper>
    </Container>
  );
};

export default Dashboard;