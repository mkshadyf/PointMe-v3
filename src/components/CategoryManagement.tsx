import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/utils/trpc'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string(),
})

type CategoryFormData = z.infer<typeof categorySchema>

const CategoryManagement: React.FC = () => {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const utils = trpc.useContext()

  const { data: categories } = trpc.admin.categories.getAll.useQuery()

  const createCategory = trpc.admin.categories.create.useMutation({
    onSuccess: () => {
      utils.admin.categories.getAll.invalidate()
      reset()
    },
  })

  const updateCategory = trpc.admin.categories.update.useMutation({
    onSuccess: () => {
      utils.admin.categories.getAll.invalidate()
      setEditingId(null)
      reset()
    },
  })

  const deleteCategory = trpc.admin.categories.delete.useMutation({
    onSuccess: () => {
      utils.admin.categories.getAll.invalidate()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = (data: CategoryFormData) => {
    if (editingId) {
      updateCategory.mutate({ id: editingId, ...data })
    } else {
      createCategory.mutate(data)
    }
  }

  const handleEdit = (category: typeof categories[0]) => {
    setEditingId(category.id)
    setValue('name', category.name)
    setValue('description', category.description ?? '')
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate({ id })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    reset()
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Category Management
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={
                        createCategory.isLoading || updateCategory.isLoading
                      }
                    >
                      {editingId ? 'Update' : 'Add'} Category
                    </Button>
                    {editingId && (
                      <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Categories
                </Typography>
                <List>
                  {categories?.map((category) => (
                    <ListItem key={category.id}>
                      <ListItemText
                        primary={category.name}
                        secondary={category.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEdit(category)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(category.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default CategoryManagement
