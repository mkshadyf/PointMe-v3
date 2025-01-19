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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import useSWR, { useSWRConfig } from 'swr';
import { adminService } from '@/services/adminService';
import type { Business } from '../../types/business';

interface BusinessApprovalProps {
  onClose?: () => void;
}

export default function BusinessApproval({ onClose }: BusinessApprovalProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const { mutate } = useSWRConfig();

  // Fetch pending businesses
  const { data: pendingBusinesses, error, isLoading } = useSWR(
    'pendingBusinesses',
    () => adminService.getPendingBusinesses()
  );

  // Approve business mutation
  const handleApprove = async (businessId: string) => {
    try {
      await adminService.approveBusinesses(businessId);
      mutate('pendingBusinesses');
      setReviewDialogOpen(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to approve business:', error);
    }
  };

  // Reject business mutation
  const handleReject = async (businessId: string) => {
    try {
      await adminService.rejectBusiness(businessId, reviewNote);
      mutate('pendingBusinesses');
      setReviewDialogOpen(false);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to reject business:', error);
    }
  };

  // Suspend business mutation
  const handleSuspend = async (businessId: string) => {
    try {
      await adminService.suspendUser(businessId);
      mutate('pendingBusinesses');
    } catch (error) {
      console.error('Failed to suspend business:', error);
    }
  };

  const handleOpenReview = (business: Business) => {
    setSelectedBusiness(business);
    setReviewDialogOpen(true);
  };

  const handleCloseReview = () => {
    setReviewDialogOpen(false);
    setSelectedBusiness(null);
    setReviewNote('');
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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading approval requests
      </Typography>
    );
  }

  if (!pendingBusinesses?.length) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body1" color="text.secondary">
          No pending approval requests
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Business Approvals
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingBusinesses?.map((business) => (
              <TableRow key={business.id}>
                <TableCell>{business.name}</TableCell>
                <TableCell>{business.ownerId}</TableCell>
                <TableCell>{business.category}</TableCell>
                <TableCell>
                  <Chip
                    label={business.status}
                    color={
                      business.status === 'pending'
                        ? 'warning'
                        : business.status === 'approved'
                        ? 'success'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleApprove(business.id)}
                    disabled={business.status !== 'pending'}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleReject(business.id)}
                    disabled={business.status !== 'pending'}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            component="a"
            onClick={() => handleReject(selectedBusiness?.id || '')}
            color="error"
            disabled={!reviewNote}
          >
            Reject
          </Button>
          <Button
            component="a"
            onClick={() => handleApprove(selectedBusiness?.id || '')}
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
