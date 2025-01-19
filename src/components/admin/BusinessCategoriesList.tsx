import React, { useState } from 'react'
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
import useSWR, { useSWRConfig } from 'swr'
import categoryService from '../../services/categoryService'
import { BusinessCategory } from '../../types/category'
import EditBusinessCategoryDialog from './EditBusinessCategoryDialog'

const BusinessCategoriesList = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { mutate } = useSWRConfig()

  const { data: categories, error, isLoading } = useSWR('businessCategories', () =>
    categoryService.getBusinessCategories()
  )

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, category: BusinessCategory) => {
    setAnchorEl(event.currentTarget)
    setSelectedCategory(category)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEditClick = () => {
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleDeleteClick = async () => {
    if (selectedCategory) {
      try {
        await categoryService.deleteBusinessCategory(selectedCategory.id)
        mutate('businessCategories')
      } catch (error) {
        console.error('Failed to delete business category:', error)
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

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading categories
      </Typography>
    )
  }

  return (
    <>
      <TableContainer component={Paper}>
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
            {categories?.map((category) => (
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
                  <IconButton onClick={(e) => handleMenuClick(e, category)}>
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
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
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
