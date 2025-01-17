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
import { useQuery, useMutation, useQueryClient } from 'react-query'
import adminService from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingButton } from '@mui/lab'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { BusinessCategory, CreateBusinessCategoryInput, UpdateBusinessCategoryInput } from '../../types/category'

const Categories: React.FC = () => {
  const { user } = useAuthStore()
  const { showNotification } = useNotification()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<BusinessCategory | null>(
    null
  )
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(
    null
  )

  const { data: categories } = useQuery<BusinessCategory[]>(['categories'], () =>
    adminService.getCategories()
  )

  const createMutation = useMutation(
    (data: CreateBusinessCategoryInput) => adminService.createCategory(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        showNotification('Category created successfully', 'success')
        setSelectedCategory(null)
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error')
      },
    }
  )

  const updateMutation = useMutation(
    (data: UpdateBusinessCategoryInput) => adminService.updateCategory(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        showNotification('Category updated successfully', 'success')
        setSelectedCategory(null)
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error')
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => adminService.deleteCategory(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        showNotification('Category deleted successfully', 'success')
      },
      onError: () => {
        showNotification('Failed to delete category', 'error')
      },
    }
  )

  const reorderMutation = useMutation(
    (categories: { id: string; order: number }[]) =>
      adminService.updateCategoriesOrder(categories),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        showNotification('Categories reordered successfully', 'success')
      },
      onError: (error: Error) => {
        showNotification(error.message, 'error')
      },
    }
  )

  const handleOpenDialog = (
    category?: BusinessCategory,
    parentId?: string | null
  ) => {
    setSelectedCategory(category || null)
    setSelectedParentId(parentId || null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedCategory(null)
    setSelectedParentId(null)
    setDialogOpen(false)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !categories) return

    const reorderedCategories = Array.from(categories)
    const [removed] = reorderedCategories.splice(result.source.index, 1)
    reorderedCategories.splice(result.destination.index, 0, removed)

    reorderMutation.mutate(reorderedCategories.map((category, index) => ({ id: category.id, order: index })))
  }

  const handleCreateCategory = async (categoryData: CreateBusinessCategoryInput) => {
    await createMutation.mutateAsync(categoryData)
  }

  const CategoryForm = () => {
    const [formData, setFormData] = React.useState({
      name: selectedCategory?.name || '',
      description: selectedCategory?.description || '',
      icon: selectedCategory?.icon || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const data = {
        ...formData,
        ...(selectedCategory && { id: selectedCategory.id }),
        ...(selectedParentId && { parentId: selectedParentId }),
      }

      if (selectedCategory) {
        updateMutation.mutate(data)
      } else {
        handleCreateCategory(data)
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
            loading={createMutation.isLoading || updateMutation.isLoading}
          >
            {selectedCategory ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </form>
    )
  }

  const CategoryItem: React.FC<{
    category: BusinessCategory
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
              onClick={() => handleOpenDialog(null, category.id)}
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
                  deleteMutation.mutate(category.id)
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
            {selectedCategory
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
