import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Pages (to be created)
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import WorkflowEditorPage from '../pages/WorkflowEditorPage';
import ProtectedRoute from '../components/ProtectedRoute';

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
