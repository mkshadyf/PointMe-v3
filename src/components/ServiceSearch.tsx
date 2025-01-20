import { useState } from 'react'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  SelectChangeEvent
} from '@mui/material'

interface ServiceSearchProps {
  onSearch: (query: string, priceRange: [number, number], duration: number | null) => void
}

export default function ServiceSearch({ onSearch }: ServiceSearchProps) {
  const [query, setQuery] = useState('')
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(1000)
  const [duration, setDuration] = useState<number | null>(null)

  const handleDurationChange = (event: SelectChangeEvent<number | null>) => {
    setDuration(event.target.value as number | null)
  }

  const handleSearch = () => {
    onSearch(query, [minPrice, maxPrice], duration)
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Services
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          label="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
          sx={{ width: 120 }}
        />
        <TextField
          type="number"
          label="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          sx={{ width: 120 }}
        />
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Duration</InputLabel>
          <Select
            value={duration}
            onChange={handleDurationChange}
            label="Duration"
          >
            <MenuItem value=''>Any</MenuItem>
            <MenuItem value={30}>30 minutes</MenuItem>
            <MenuItem value={60}>1 hour</MenuItem>
            <MenuItem value={90}>1.5 hours</MenuItem>
            <MenuItem value={120}>2 hours</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
    </Box>
  )
}
