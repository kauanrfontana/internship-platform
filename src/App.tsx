import { RouterProvider } from 'react-router-dom'
import './global.css'
import { router } from './pages/routes'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme/theme-provider'
import { AuthProvider } from './middlewares/auth-provider'

export function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <ThemeProvider storageKey="intership-platform-theme" defaultTheme='dark'>
          <Helmet titleTemplate='%s | internship.platform' />
          <Toaster richColors />

          <RouterProvider router={router} />
        </ThemeProvider>
      </HelmetProvider>
    </AuthProvider>
  )
}
