import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { Link } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { createTrpcFetcher, createTrpcKey, createTrpcMutation } from '@/utils/swr-helpers';
import { CreateBusinessInput, UpdateBusinessInput } from '../types/business';
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

  const { data: businesses, error } = useSWR(
    createTrpcKey(['business', 'getOwned']),
    createTrpcFetcher(['business', 'getOwned'])
  )

  const createBusiness = createTrpcMutation(['business', 'create'])

  const handleCreateBusiness = async (data: CreateBusinessInput) => {
    try {
      await createBusiness(data)
      await mutate(createTrpcKey(['business', 'getOwned']))
      reset()
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
        <Box component="form" onSubmit={handleSubmit(handleCreateBusiness)} noValidate sx={{ mt: 1 }}>
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
      {error ? (
        <Typography color="error">Error loading businesses</Typography>
      ) : !businesses ? (
        <Typography>Loading...</Typography>
      ) : (
        <List>
          {businesses.map((business) => (
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
