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
import { useAuthStore } from '@/stores/authStore'
import { businessService } from '@/services/businessService'
import useSWR, { useSWRConfig } from 'swr'

const steps = ['Business Information', 'Category Selection', 'Services Setup']

const BusinessSetup: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate } = useSWRConfig()
  const [activeStep, setActiveStep] = React.useState(0)
  const [businessData, setBusinessData] = React.useState<any>({})
  const [selectedCategory, setSelectedCategory] = React.useState('')

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleBusinessInfoSubmit = async (data: any) => {
    try {
      await businessService.createBusiness({ ...data, userId: user!.id })
      mutate(['business', user!.id])
      handleNext()
    } catch (error) {
      console.error('Failed to create business:', error)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    try {
      await businessService.updateBusinessCategory(businessData.id, categoryId)
      mutate(['business', user!.id])
      setSelectedCategory(categoryId)
      handleNext()
    } catch (error) {
      console.error('Failed to update business category:', error)
    }
  }

  const handleServicesSubmit = async (services: any[]) => {
    try {
      await businessService.updateBusinessServices(businessData.id, services)
      mutate(['business', user!.id])
      handleNext()
    } catch (error) {
      console.error('Failed to update business services:', error)
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BusinessInfoForm
            initialData={businessData}
            onSubmit={handleBusinessInfoSubmit}
          />
        )
      case 1:
        return (
          <CategorySelectionForm
            selectedCategory={selectedCategory}
            onSubmit={handleCategorySelect}
          />
        )
      case 2:
        return (
          <ServicesSetupForm
            categoryId={selectedCategory}
            onSubmit={handleServicesSubmit}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Set Up Your Business
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={() => navigate('/business')}>
              Finish
            </Button>
          ) : null}
        </Box>
      </Paper>
    </Container>
  )
}

export default BusinessSetup
