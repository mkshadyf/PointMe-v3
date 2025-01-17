import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  isDefault: boolean;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingMethod, setEditingMethod] = React.useState<PaymentMethod | null>(null);
  const [formData, setFormData] = React.useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
  });

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      // Pre-fill form data if editing
      setFormData({
        cardNumber: `****${method.last4}`,
        expMonth: method.expMonth?.toString() || '',
        expYear: method.expYear?.toString() || '',
        cvc: '',
      });
    } else {
      setEditingMethod(null);
      setFormData({
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMethod(null);
    setFormData({
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvc: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle payment method creation/update
      handleCloseDialog();
    } catch (error) {
      // Show error message
    }
  };

  const handleDelete = async (methodId: string) => {
    try {
      // Handle payment method deletion
      setPaymentMethods((prev) => prev.filter((method) => method.id !== methodId));
    } catch (error) {
      // Show error message
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      // Handle setting default payment method
      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isDefault: method.id === methodId,
        }))
      );
    } catch (error) {
      // Show error message
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Payment Methods"
          action={
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={() => handleOpenDialog()}
            >
              Add Payment Method
            </Button>
          }
        />
        <CardContent>
          <List>
            {paymentMethods.map((method) => (
              <ListItem key={method.id}>
                <ListItemText
                  primary={
                    method.type === 'card'
                      ? `${method.brand} •••• ${method.last4}`
                      : `${method.bankName} •••• ${method.last4}`
                  }
                  secondary={
                    method.type === 'card'
                      ? `Expires ${method.expMonth}/${method.expYear}`
                      : 'Bank Account'
                  }
                />
                <ListItemSecondaryAction>
                  {!method.isDefault && (
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(method.id)}
                      sx={{ mr: 1 }}
                    >
                      Set Default
                    </Button>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(method)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(method.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          {paymentMethods.length === 0 && (
            <Typography color="textSecondary" align="center">
              No payment methods added yet
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration Month"
                  name="expMonth"
                  value={formData.expMonth}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration Year"
                  name="expYear"
                  value={formData.expYear}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CVC"
                  name="cvc"
                  type="password"
                  value={formData.cvc}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingMethod ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default PaymentMethods;
