import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'

import router from './router/index'
import { ToastProvider } from './contexts/ToastContext'
import { UserPrefsProvider } from './contexts/UserPrefsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserPrefsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </UserPrefsProvider>
  </StrictMode>,
)
