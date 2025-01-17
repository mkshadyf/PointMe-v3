import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import adminService from '../../services/adminService';
import type { Business } from '../../types/business';

interface BusinessApprovalProps {
  onClose?: () => void;
}

export default function BusinessApproval({ onClose }: BusinessApprovalProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch pending businesses
  const { data: pendingBusinesses, isLoading } = useQuery(
    'pendingBusinesses',
    () => adminService.getPendingBusinesses()
  );

  // Approve business mutation
  const approveMutation = useMutation(
    (businessId: string) => adminService.approveBusinesses(businessId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingBusinesses');
        setReviewDialogOpen(false);
        setSelectedBusiness(null);
      },
    }
  );

  // Reject business mutation
  const rejectMutation = useMutation(
    ({ businessId, reason }: { businessId: string; reason: string }) =>
      adminService.rejectBusiness(businessId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingBusinesses');
        setReviewDialogOpen(false);
        setSelectedBusiness(null);
      },
    }
  );

  // Suspend business mutation
  const suspendMutation = useMutation(
    (businessId: string) => adminService.suspendUser(businessId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingBusinesses');
      },
    }
  );

  const handleOpenReview = (business: Business) => {
    setSelectedBusiness(business);
    setReviewDialogOpen(true);
  };

  const handleCloseReview = () => {
    setReviewDialogOpen(false);
    setSelectedBusiness(null);
    setReviewNote('');
  };

  const handleApprove = () => {
    if (selectedBusiness) {
      approveMutation.mutate(selectedBusiness.id);
    }
  };

  const handleReject = () => {
    if (selectedBusiness && reviewNote) {
      rejectMutation.mutate({
        businessId: selectedBusiness.id,
        reason: reviewNote,
      });
    }
  };

  const handleSuspend = (businessId: string) => {
    suspendMutation.mutate(businessId);
  };

  const BusinessCard: React.FC<{ business: Business }> = ({ business }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">{business.name}</Typography>
          <Typography color="textSecondary" gutterBottom>
            ID: {business.id}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Approve">
            <IconButton
              color="success"
              onClick={() => handleOpenReview(business)}
            >
              <ApproveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              color="error"
              onClick={() => handleOpenReview(business)}
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Contact Information:
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center">
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography>{business.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography>{business.phone}</Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mt={1}>
          <LocationIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>{business.address}</Typography>
        </Box>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Business Details:
        </Typography>
        <Typography>{business.description}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Category:
        </Typography>
        <Chip label={business.category} />
        {business.subcategories?.map((subcat) => (
          <Chip key={subcat} label={subcat} sx={{ ml: 1 }} />
        ))}
      </Box>
    </Paper>
  );

  if (isLoading) {
    return (
      <Box p={3}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Business Approvals
      </Typography>
      {pendingBusinesses?.length === 0 ? (
        <Alert severity="info">No pending business approvals</Alert>
      ) : (
        pendingBusinesses?.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))
      )}

      <Dialog open={reviewDialogOpen} onClose={handleCloseReview}>
        <DialogTitle>
          Review Business: {selectedBusiness?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Review Notes"
            fullWidth
            multiline
            rows={4}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReview}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            disabled={!reviewNote}
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            disabled={!selectedBusiness}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
