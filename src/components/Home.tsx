import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

 export default function Home() {
   return (
     <Container maxWidth="lg">
       <Box sx={{ my: 4, textAlign: 'center' }}>
         <Typography variant="h2" component="h1" gutterBottom>
           Welcome to PointMe!
         </Typography>
         <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
           Your one-stop solution for service booking
         </Typography>
         <Box sx={{ mt: 4 }}>
           <RouterLink to="/login" style={{ textDecoration: 'none' }}>
             <Button
               variant="contained"
               color="primary"
               size="large"
               sx={{ mr: 2 }}
             >
               Login
             </Button>
           </RouterLink>
         
           <RouterLink to="/signup" style={{ textDecoration: 'none' }}>
             <Button
               variant="outlined"
               size="large"
             >
               Sign Up
             </Button>
           </RouterLink>
         </Box>
       </Box>
     </Container>
   )
 }