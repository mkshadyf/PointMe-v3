import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Avatar,
  ChipProps,
  SelectChangeEvent,
} from '@mui/material'
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import useSWR from 'swr'
import { createTrpcFetcher, createTrpcKey, createTrpcMutation } from '@/utils/swr-helpers'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { format } from 'date-fns'
import { User, UserRole } from '@/types/user'

interface FilterState {
  role: string;
  status: string;
  search: string;
}

interface UpdateUserData {
  role?: UserRole;
  status?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    role: '',
    status: '',
    search: '',
  })

  const { data: users, error } = useSWR<User[]>(
    createTrpcKey(['admin', 'users', 'getAll'], filters),
    createTrpcFetcher(['admin', 'users', 'getAll'], filters)
  )

  const updateUser = createTrpcMutation(['admin', 'users', 'update'])
  const deleteUser = createTrpcMutation(['admin', 'users', 'delete'])

  const handleUpdateUser = async (userId: string, data: UpdateUserData) => {
    try {
      await updateUser({ id: userId, ...data })
      showNotification('User updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update user:', error)
      showNotification('Failed to update user', 'error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser({ id: userId })
      showNotification('User deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete user:', error)
      showNotification('Failed to delete user', 'error')
    }
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
    setDialogOpen(false)
  }

  const handleFilterChange = (
    field: keyof FilterState,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleStatusChange = (userId: string, status: string) => {
    handleUpdateUser(userId, { status })
  }

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'suspended':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const UserDialog: React.FC = () => {
    const [formData, setFormData] = React.useState<UpdateUserData>({
      role: selectedUser?.role || '',
      status: selectedUser?.status || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedUser) {
        handleUpdateUser(selectedUser.id, formData)
        handleCloseDialog()
      }
    }

    const handleRoleChange = (e: SelectChangeEvent<string>) => {
      setFormData({ ...formData, role: e.target.value as UserRole })
    }

    const handleStatusChange = (e: SelectChangeEvent<string>) => {
      setFormData({ ...formData, status: e.target.value })
    }

    return (
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="business_owner">Business Owner</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <LoadingButton type="submit">Update</LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have permission to access this page
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>

        <Paper sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange('search', e.target.value)
                }
                InputProps={{
                  endAdornment: <SearchIcon color="action" />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) =>
                    handleFilterChange('role', e.target.value)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="business_owner">Business Owner</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) =>
                    handleFilterChange('status', e.target.value)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Reports</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={user.avatar_url}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {user.name?.[0] || user.email[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{user.name || user.email}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={
                        user.role === 'admin'
                          ? 'error'
                          : user.role === 'business_owner'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      color={getStatusColor(user.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {user.businessName || '-'}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'PPp')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {user.reportCount > 0 ? (
                      <Tooltip title={`${user.reportCount} reports`}>
                        <WarningIcon color="error" />
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    {user.status === 'active' ? (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleStatusChange(user.id, 'suspended')
                        }
                      >
                        <BlockIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() =>
                          handleStatusChange(user.id, 'active')
                        }
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete this user?'
                          )
                        ) {
                          handleDeleteUser(user.id)
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <UserDialog />
      </Box>
    </Container>
  )
}

export default UserManagement
