import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  CircularProgress,
} from '@mui/material'
import { useQuery } from 'react-query'
import categoryService from '../../services/categoryService'
import { BusinessCategory } from '../../types/category'

interface CategorySelectionFormProps {
  selectedCategory: string
  onSubmit: (categoryId: string) => void
}

const CategorySelectionForm: React.FC<CategorySelectionFormProps> = ({
  selectedCategory,
  onSubmit,
}) => {
  const { data: categories, isLoading, error } = useQuery(
    'businessCategories',
    () => categoryService.getBusinessCategories()
  )

  const handleCategorySelect = (categoryId: string) => {
    onSubmit(categoryId)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">
          Failed to load categories. Please try again later.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select your business category
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the category that best describes your business. This will help us customize your experience
        and make it easier for customers to find you.
      </Typography>

      <Grid container spacing={2}>
        {categories?.map((category: BusinessCategory) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                height: '100%',
                borderColor: selectedCategory === category.id ? 'primary.main' : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid',
              }}
            >
              <CardActionArea
                onClick={() => handleCategorySelect(category.id)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedCategory && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => onSubmit(selectedCategory)}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default CategorySelectionForm

