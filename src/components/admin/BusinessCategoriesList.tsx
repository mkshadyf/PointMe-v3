import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import categoryService from '../../services/categoryService'
import { BusinessCategory } from '../../types/category'
import EditBusinessCategoryDialog from './EditBusinessCategoryDialog'

const BusinessCategoriesList: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = React.useState<BusinessCategory | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  const { data: categories, isLoading } = useQuery(
    'businessCategories',
    () => categoryService.getBusinessCategories()
  )

  const deleteMutation = useMutation(
    (id: string) => categoryService.deleteBusinessCategory(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('businessCategories')
      },
    }
  )

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, category: BusinessCategory) => {
    setAnchorEl(event.currentTarget)
    setSelectedCategory(category)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteMutation.mutateAsync(selectedCategory.id)
      } catch (error) {
        console.error('Failed to delete category:', error)
        // Handle error (show notification, etc.)
      }
    }
    handleMenuClose()
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (!categories?.length) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body1" color="text.secondary">
          No business categories found. Add your first category to get started.
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Businesses</TableCell>
              <TableCell>Services</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell component="th" scope="row">
                  {category.name}
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Chip
                    label="0 businesses"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label="0 services"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="category actions"
                    onClick={(e) => handleMenuClick(e, category)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      {selectedCategory && (
        <EditBusinessCategoryDialog
          open={editDialogOpen}
          category={selectedCategory}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedCategory(null)
          }}
        />
      )}
    </>
  )
}

export default BusinessCategoriesList
