import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Paper, Grid, Rating, Chip } from '@mui/material';
import { trpc } from '../utils/trpc';
import BusinessReviews from './BusinessReviews';

const PublicBusinessPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const businessQuery = trpc.business.getPublicBusinessDetails.useQuery(businessId!);

  if (businessQuery.isLoading) {
    return <Typography>Loading business details...</Typography>;
  }

  if (businessQuery.isError) {
    return <Typography color="error">Error loading business details</Typography>;
  }

  const { name, description, services, averageRating } = businessQuery.data;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {name}
        </Typography>
        {averageRating !== null && (
          <Box display="flex" alignItems="center" mb={2}>
            <Rating value={averageRating} readOnly precision={0.5} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({averageRating.toFixed(1)})
            </Typography>
          </Box>
        )}
        <Typography variant="body1" paragraph>
          {description}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Services
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {services.map((service) => (
            <Grid item key={service.id} xs={12} sm={6} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1">{service.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="body2">
                    ${service.price.toFixed(2)}
                  </Typography>
                  <Chip label={`${service.duration} min`} size="small" />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <BusinessReviews businessId={businessId!} />
      </Paper>
    </Box>
  );
};

export default PublicBusinessPage;

