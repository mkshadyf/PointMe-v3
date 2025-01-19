import React, { useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useSWR, { useSWRConfig } from 'swr'
import categoryService from '../../services/categoryService'
import { ServiceCategory } from '../../types/category'
import EditServiceCategoryDialog from './EditServiceCategoryDialog'

const ServiceCategoriesList = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { mutate } = useSWRConfig()

  // Fetch service categories
  const { data: categories = [] } = useSWR('serviceCategories', () =>
    categoryService.getServiceCategories()
  )

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, category: ServiceCategory) => {
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
        await categoryService.deleteServiceCategory(selectedCategory.id)
        mutate('serviceCategories')
      } catch (error) {
        console.error('Failed to delete service category:', error)
      }
    }
    handleMenuClose()
  }

  return (
    <>
      <List>
        {categories.map((category) => (
          <ListItem key={category.id}>
            <ListItemText
              primary={category.name}
              secondary={category.description}
            />
            <Chip
              label={category.isActive ? 'Active' : 'Inactive'}
              color={category.isActive ? 'success' : 'default'}
              size="small"
              sx={{ mr: 2 }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={(e) => handleMenuClick(e, category)}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      {selectedCategory && (
        <EditServiceCategoryDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          category={selectedCategory}
        />
      )}
    </>
  )
}

export default ServiceCategoriesList