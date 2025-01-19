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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import useSWR from 'swr'
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
  const { data: categories, error } = useSWR(
    'businessCategories',
    () => categoryService.getCategories()
  )

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">
          Error loading categories
        </Typography>
      </Box>
    )
  }

  if (!categories) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Business Category</InputLabel>
      <Select
        value={selectedCategory || ''}
        onChange={(e) => onSubmit(e.target.value)}
        label="Business Category"
      >
        {categories.map((category: BusinessCategory) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CategorySelectionForm
