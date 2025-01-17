import React from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tab,
  Tabs,
} from '@mui/material'
import BusinessCategoriesList from './BusinessCategoriesList'
import ServiceCategoriesList from './ServiceCategoriesList'
import AddBusinessCategoryDialog from './AddBusinessCategoryDialog'
import AddServiceCategoryDialog from './AddServiceCategoryDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`category-tabpanel-${index}`}
    aria-labelledby={`category-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
)

const CategoryManagement: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0)
  const [isBusinessCategoryDialogOpen, setIsBusinessCategoryDialogOpen] = React.useState(false)
  const [isServiceCategoryDialogOpen, setIsServiceCategoryDialogOpen] = React.useState(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Category Management
              </Typography>
              <Button
                variant="contained"
                onClick={() => 
                  tabValue === 0
                    ? setIsBusinessCategoryDialogOpen(true)
                    : setIsServiceCategoryDialogOpen(true)
                }
              >
                Add {tabValue === 0 ? 'Business' : 'Service'} Category
              </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="category management tabs"
              >
                <Tab label="Business Categories" />
                <Tab label="Service Categories" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <BusinessCategoriesList />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ServiceCategoriesList />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <AddBusinessCategoryDialog
        open={isBusinessCategoryDialogOpen}
        onClose={() => setIsBusinessCategoryDialogOpen(false)}
      />

      <AddServiceCategoryDialog
        open={isServiceCategoryDialogOpen}
        onClose={() => setIsServiceCategoryDialogOpen(false)}
      />
    </Container>
  )
}

export default CategoryManagement
