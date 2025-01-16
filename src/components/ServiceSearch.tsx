import React, { useState } from 'react'
import { TextField, Select, MenuItem, InputLabel, FormControl, Box, Button } from '@mui/material'
import { Search } from 'lucide-react'

interface ServiceSearchProps {
  onSearch: (searchTerm: string, priceRange: [number, number], duration: number | null) => void
}

const ServiceSearch: React.FC<ServiceSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [duration, setDuration] = useState<number | null>(null)

  const handleSearch = () => {
    onSearch(searchTerm, priceRange, duration)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
      <TextField
        label="Search services"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Min Price"
          type="number"
          variant="outlined"
          value={priceRange[0]}
          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
        />
        <TextField
          label="Max Price"
          type="number"
          variant="outlined"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="duration-label">Duration</InputLabel>
          <Select
            labelId="duration-label"
            value={duration || ''}
            onChange={(e) => setDuration(e.target.value as number | null)}
            label="Duration"
          >
            <MenuItem value={null}>Any</MenuItem>
            <MenuItem value={30}>30 min</MenuItem>
            <MenuItem value={60}>1 hour</MenuItem>
            <MenuItem value={90}>1.5 hours</MenuItem>
            <MenuItem value={120}>2 hours</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch} startIcon={<Search />}>
          Search
        </Button>
      </Box>
    </Box>
  )
}

export default ServiceSearch

