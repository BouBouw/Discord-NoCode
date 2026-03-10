import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

// Pages (to be created)
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import WorkflowEditorPage from '../pages/WorkflowEditorPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'workflow/:id',
        element: <ProtectedRoute><WorkflowEditorPage /></ProtectedRoute>
      },
      {
        path: 'workflow/new',
        element: <ProtectedRoute><WorkflowEditorPage /></ProtectedRoute>
      }
    ]
  }
]);

export default router;
