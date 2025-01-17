import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
} from '@mui/material'
import BusinessInfoForm from './business/BusinessInfoForm'
import CategorySelectionForm from './business/CategorySelectionForm'
import ServicesSetupForm from './business/ServicesSetupForm'
import { useAuthStore } from '../stores/authStore'
import businessService from '../services/businessService'
import { useQuery } from 'react-query'

const steps = ['Business Information', 'Category Selection', 'Services Setup']

const BusinessSetup: React.FC = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = React.useState(0)
  const [businessData, setBusinessData] = React.useState({
    name: '',
    description: '',
    categoryId: '',
    services: []
  })
  
  const { user } = useAuthStore()

  // Check if user already has a business
  const { data: existingBusiness, isLoading } = useQuery(
    ['business', user?.id],
    () => businessService.getBusinessByOwnerId(user!.id),
    {
      enabled: !!user,
      onSuccess: (data) => {
        if (data) {
          navigate('/business/dashboard')
        }
      }
    }
  )

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleBusinessInfoSubmit = (info: { name: string; description: string }) => {
    setBusinessData((prev) => ({ ...prev, ...info }))
    handleNext()
  }

  const handleCategorySelect = (categoryId: string) => {
    setBusinessData((prev) => ({ ...prev, categoryId }))
    handleNext()
  }

  const handleServicesSubmit = async (services: any[]) => {
    setBusinessData((prev) => ({ ...prev, services }))
    
    try {
      // Create the business
      const business = await businessService.createBusiness({
        name: businessData.name,
        description: businessData.description
      }, user!.id)

      // TODO: Create services for the business

      navigate('/business/dashboard')
    } catch (error) {
      console.error('Failed to create business:', error)
      // Handle error appropriately
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BusinessInfoForm
            initialData={{ name: businessData.name, description: businessData.description }}
            onSubmit={handleBusinessInfoSubmit}
          />
        )
      case 1:
        return (
          <CategorySelectionForm
            selectedCategory={businessData.categoryId}
            onSubmit={handleCategorySelect}
          />
        )
      case 2:
        return (
          <ServicesSetupForm
            categoryId={businessData.categoryId}
            onSubmit={handleServicesSubmit}
          />
        )
      default:
        return 'Unknown step'
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Set Up Your Business
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default BusinessSetup
