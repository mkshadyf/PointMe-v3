import { QueryClientProvider } from '@tanstack/react-query'
import { trpc, queryClient, trpcClient } from './utils/trpc'
import Router from './Router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import {theme} from './styles/theme'
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}