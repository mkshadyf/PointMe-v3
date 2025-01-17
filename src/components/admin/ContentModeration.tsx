import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
} from '@mui/material'
import {
  Flag as FlagIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Image as ImageIcon,
  Message as MessageIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import adminService from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { format } from 'date-fns'

interface Report {
  id: string
  type: string
  reason: string
  description: string
  status: string
  createdAt: string
  reportedBy: {
    id: string
    name: string
    avatarUrl: string
  }
  content: {
    id: string
    type: string
    data: any
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const ContentModeration: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = React.useState(0)
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(
    null
  )
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [actionNote, setActionNote] = React.useState('')

  const { data: reports, isLoading } = useQuery(
    ['reports', tabValue],
    () => adminService.getContentReports()
  )

  const updateReportMutation = useMutation(
    (data: { id: string; status: string; note: string }) =>
      data.status === 'resolved'
        ? adminService.resolveReport(data.id)
        : adminService.dismissReport(data.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports'])
        setDialogOpen(false)
        setActionNote('')
      },
    }
  )

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleOpenDialog = (report: Report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedReport(null)
    setDialogOpen(false)
    setActionNote('')
  }

  const handleAction = (status: string) => {
    if (selectedReport) {
      updateReportMutation.mutate({
        id: selectedReport.id,
        status,
        note: actionNote,
      })
    }
  }

  const handleDeleteContent = async (contentId: string, contentType: string) => {
    try {
      // Instead of deleting content, we'll resolve the report
      await updateReportMutation.mutateAsync({
        id: contentId,
        status: 'resolved',
        note: 'Content removed',
      })
    } catch (error) {
      console.error('Error handling content:', error)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business':
        return <BusinessIcon />
      case 'user':
        return <PersonIcon />
      case 'image':
        return <ImageIcon />
      case 'message':
        return <MessageIcon />
      default:
        return <FlagIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'resolved':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const ReportCard: React.FC<{ report: Report }> = ({ report }) => (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                mr: 2,
              }}
            >
              {getReportIcon(report.type)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {report.type} Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reported {format(new Date(report.createdAt), 'PPp')}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={report.status}
            color={getStatusColor(report.status)}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Reason
          </Typography>
          <Typography variant="body2">{report.reason}</Typography>
          {report.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {report.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Reported By
          </Typography>
          <Box display="flex" alignItems="center">
            <Avatar
              src={report.reportedBy.avatarUrl}
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {report.reportedBy.name[0]}
            </Avatar>
            <Typography variant="body2">
              {report.reportedBy.name}
            </Typography>
          </Box>
        </Box>

        {report.content.type === 'image' && (
          <Box sx={{ mt: 2 }}>
            <img
              src={report.content.data.url}
              alt="Reported content"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {report.content.type === 'message' && (
          <Box sx={{ mt: 2 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, backgroundColor: 'grey.50' }}
            >
              <Typography variant="body2">
                {report.content.data.text}
              </Typography>
            </Paper>
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<WarningIcon />}
          onClick={() => handleOpenDialog(report)}
        >
          Take Action
        </Button>
        {report.status === 'pending' && (
          <>
            <Button
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() =>
                updateReportMutation.mutate({
                  id: report.id,
                  status: 'resolved',
                  note: '',
                })
              }
            >
              Resolve
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<BlockIcon />}
              onClick={() =>
                updateReportMutation.mutate({
                  id: report.id,
                  status: 'rejected',
                  note: '',
                })
              }
            >
              Reject
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  )

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
          Content Moderation
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={
                <Badge
                  badgeContent={
                    reports?.filter(
                      (r) => r.status === 'pending'
                    ).length
                  }
                  color="error"
                >
                  Pending
                </Badge>
              }
            />
            <Tab label="Resolved" />
            <Tab label="Rejected" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {reports?.map((report) => (
                <Grid item xs={12} md={6} key={report.id}>
                  <ReportCard report={report} />
                </Grid>
              ))}
            </Grid>

            {reports?.length === 0 && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                >
                  No reports found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 0
                    ? 'No pending reports to review'
                    : tabValue === 1
                    ? 'No resolved reports'
                    : 'No rejected reports'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Take Action</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Action Notes"
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <LoadingButton
              color="error"
              onClick={() => handleDeleteContent(selectedReport?.id, selectedReport?.content.type)}
              loading={updateReportMutation.isLoading}
            >
              Delete Content
            </LoadingButton>
            <LoadingButton
              color="success"
              onClick={() => handleAction('resolved')}
              loading={updateReportMutation.isLoading}
            >
              Resolve
            </LoadingButton>
            <LoadingButton
              color="error"
              onClick={() => handleAction('rejected')}
              loading={updateReportMutation.isLoading}
            >
              Reject
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default ContentModeration
