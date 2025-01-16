import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { CreateBusinessInput } from '../types/business';
import RoleBasedAccess from './RoleBasedAccess';

const createBusinessSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
})

interface BusinessManagementProps {
  onSelectBusiness: (businessId: string) => void
}

const BusinessManagement: React.FC<BusinessManagementProps> = ({ onSelectBusiness }) => {
  const { control, handleSubmit, reset } = useForm<CreateBusinessInput>({
    resolver: zodResolver(createBusinessSchema),
  })

  const createBusinessMutation = trpc.business.create.useMutation()
  const ownedBusinessesQuery = trpc.business.getOwned.useQuery()

  const onSubmit = async (data: CreateBusinessInput) => {
    try {
      await createBusinessMutation.mutateAsync(data)
      reset()
      ownedBusinessesQuery.refetch()
    } catch (error) {
      console.error('Failed to create business:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Your Businesses
      </Typography>
      <RoleBasedAccess allowedRoles={['business_owner', 'admin']}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Business Name"
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="description"
                label="Business Description"
                multiline
                rows={4}
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Create Business
          </Button>
        </Box>
      </RoleBasedAccess>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Your Businesses
      </Typography>
      {ownedBusinessesQuery.isLoading ? (
        <Typography>Loading...</Typography>
      ) : ownedBusinessesQuery.isError ? (
        <Typography color="error">Error loading businesses</Typography>
      ) : (
        <List>
          {ownedBusinessesQuery.data?.map((business) => (
            <ListItem key={business.id}>
              <ListItemText primary={business.name} secondary={business.description} />
              <ListItemSecondaryAction>
                <Button onClick={() => onSelectBusiness(business.id)}>
                  Select
                </Button>
                <Button component={Link} to={`/business/${business.id}`} color="primary">
                  View Public Page
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default BusinessManagement;

