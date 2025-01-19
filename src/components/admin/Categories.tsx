import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material'
import useSWR, { useSWRConfig } from 'swr'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { BusinessCategory, Category, CreateBusinessCategoryInput, UpdateBusinessCategoryInput } from '../../types/category'
import { AlertColor } from '@mui/material'
import { showNotification } from '../../utils/notification'

interface CategoriesProps {
  onSelectCategory?: (category: Category | undefined) => void
  selectedCategory?: Category
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory, selectedCategory }) => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const { mutate } = useSWRConfig()
  const { data: categories, error, isLoading } = useSWR<Category[]>(
    'categories',
    () => adminService.getCategories(),
    { fallbackData: [] }
  )

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedCategoryState, setSelectedCategory] = React.useState<Category | undefined>(undefined)
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null)

  const handleAddCategory = async (data: CreateBusinessCategoryInput) => {
    try {
      const newCategory = await adminService.createCategory({
        ...data,
        order: categories?.length || 0
      })
      mutate('categories')
      showNotification('Category created successfully', { variant: 'success' as AlertColor })
    } catch (error) {
      console.error('Failed to create category:', error)
      showNotification('Failed to create category', { variant: 'error' as AlertColor })
    }
  }

  const handleUpdateCategory = async (categoryId: string, data: UpdateBusinessCategoryInput) => {
    try {
      await adminService.updateCategory(categoryId, data)
      mutate('categories')
      showNotification('Category updated successfully', { variant: 'success' as AlertColor })
    } catch (error) {
      console.error('Failed to update category:', error)
      showNotification('Failed to update category', { variant: 'error' as AlertColor })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await adminService.deleteCategory(categoryId)
      mutate('categories')
      showNotification('Category deleted successfully', { variant: 'success' as AlertColor })
    } catch (error) {
      console.error('Failed to delete category:', error)
      showNotification('Failed to delete category', { variant: 'error' as AlertColor })
    }
  }

  const handleOpenDialog = (
    category?: Category,
    parentId?: string | null
  ) => {
    setSelectedCategory(category || undefined)
    setSelectedParentId(parentId || null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedCategory(undefined)
    setSelectedParentId(null)
    setDialogOpen(false)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !categories) return

    const reorderedCategories = Array.from(categories)
    const [removed] = reorderedCategories.splice(result.source.index, 1)
    reorderedCategories.splice(result.destination.index, 0, removed)

    adminService.updateCategoriesOrder(reorderedCategories.map((category, index) => ({ id: category.id, order: index })))
  }

  const CategoryForm = () => {
    const [formData, setFormData] = React.useState({
      name: selectedCategoryState?.name || '',
      description: selectedCategoryState?.description || '',
      icon: selectedCategoryState?.icon || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const data = {
        ...formData,
        ...(selectedCategoryState && { id: selectedCategoryState.id }),
        ...(selectedParentId && { parentId: selectedParentId }),
      }

      if (selectedCategoryState) {
        handleUpdateCategory(selectedCategoryState.id, data)
      } else {
        handleAddCategory(data)
      }
    }

    return (
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Icon"
            value={formData.icon}
            onChange={(e) =>
              setFormData({ ...formData, icon: e.target.value })
            }
            helperText="Material-UI icon name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <LoadingButton
            type="submit"
            loading={isLoading}
          >
            {selectedCategoryState ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </form>
    )
  }

  const CategoryItem: React.FC<{
    category: Category
    index: number
    level?: number
  }> = ({ category, index, level = 0 }) => (
    <Draggable draggableId={category.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ mb: 2, ml: level * 3 }}
        >
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              {...provided.dragHandleProps}
            >
              <DragIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box flexGrow={1}>
                <Typography variant="h6">{category.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </Box>
              <Chip
                label={`${category.businessCount ? category.businessCount : 0} businesses`}
                size="small"
                sx={{ mr: 2 }}
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog(undefined, category.id)}
            >
              Add Subcategory
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleOpenDialog(category)}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete this category?'
                  )
                ) {
                  handleDeleteCategory(category.id)
                }
              }}
              disabled={category.businessCount ? category.businessCount > 0 : false}
            >
              Delete
            </Button>
          </CardActions>
          {category.subcategories && category.subcategories.length > 0 && (
            <Box sx={{ pl: 2 }}>
              {category.subcategories.map((subcategory, subIndex) => (
                <CategoryItem
                  key={subcategory.id}
                  category={subcategory}
                  index={subIndex}
                  level={level + 1}
                />
              ))}
            </Box>
          )}
        </Card>
      )}
    </Draggable>
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

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Loading...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error.message}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Categories</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {categories?.map((category, index) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedCategoryState
              ? 'Edit Category'
              : selectedParentId
              ? 'Add Subcategory'
              : 'Add Category'}
          </DialogTitle>
          <CategoryForm />
        </Dialog>
      </Box>
    </Container>
  )
}

export default Categories
