import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { AuthProvider } from '../contexts/AuthContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import MainLayout from '../layouts/MainLayout';
import OnboardingOverlay from '../components/OnboardingOverlay';

// Pages (to be created)
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import DiscordCallbackPage from '../pages/Auth/DiscordCallbackPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import DatabasesPage from '../pages/Dashboard/DatabasesPage';
import DbViewerPage from '../pages/Dashboard/DbViewerPage';
import MembersPage from '../pages/Dashboard/MembersPage';
import InstancePage from '../pages/Dashboard/InstancePage';
import WorkflowEditorPage from '../pages/Dashboard/Instances/WorkflowEditorPage';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import SettingsPage from '../pages/Dashboard/SettingsPage';
import PartnerPage from '../pages/Dashboard/PartnerPage';

const router = createBrowserRouter([
  {
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/auth/discord/callback', element: <GuestRoute><DiscordCallbackPage /></GuestRoute> },
    ],
  },
  {
    element: <AuthProvider><OnboardingProvider><MainLayout /><OnboardingOverlay /></OnboardingProvider></AuthProvider>,
    children: [
      { path: '/login', element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: '/register', element: <GuestRoute><RegisterPage /></GuestRoute> },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/databases',
        element: <ProtectedRoute><DatabasesPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/databases/:botId',
        element: <ProtectedRoute><DbViewerPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/members',
        element: <ProtectedRoute><MembersPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/instances/:id',
        element: <ProtectedRoute><InstancePage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard/partner',
        element: <ProtectedRoute><PartnerPage /></ProtectedRoute>,
      },
    ],
  },
  {
    element: <AuthProvider><OnboardingProvider><Outlet /><OnboardingOverlay /></OnboardingProvider></AuthProvider>,
    children: [
      {
        path: '/workflow/new',
        element: (
          <ProtectedRoute>
            <ReactFlowProvider>
              <WorkflowEditorPage />
            </ReactFlowProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: '/workflow/:id',
        element: (
          <ProtectedRoute>
            <ReactFlowProvider>
              <WorkflowEditorPage />
            </ReactFlowProvider>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
