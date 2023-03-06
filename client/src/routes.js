import LoginLayout from "./layouts/LoginLayout";
import MainLayout from "./layouts/MainLayout";
import CompleteRegistrationPage from "./pages/account/CompleteRegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/account/LoginPage";
import RegisterPage from "./pages/account/RegisterPage";
import PrivateRoute from './PrivateRoute';
import ThesisPage from "./pages/ThesisPage";
import SubmissionPage from "./pages/SubmissionPage";
import EditThesisPage from "./pages/EditThesisPage";
import SettingsPage from "./pages/account/SettingsPage";
import AccountPage from "./pages/AccountPage";

const routes = [
  {
    path: '/',
    element: <PrivateRoute redirect='/auth/login'><MainLayout /></PrivateRoute>,
    children: [
      {
        path: '',
        element: <DashboardPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'account/new',
        element: <AccountPage />
      },
      {
        path: 'account/:aid',
        element: <AccountPage />
      },
      {
        path: 'thesis/new',
        element: <EditThesisPage />
      },
      {
        path: 'thesis/:tid',
        element: <ThesisPage />
      },
      {
        path: 'thesis/:tid/edit',
        element: <EditThesisPage />
      },
      {
        path: 'thesis/:tid/submission/:sid',
        element: <SubmissionPage />
      },
    ]
  },
  {
    path: '/auth',
    element: <LoginLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'complete',
        element: <CompleteRegistrationPage />
      },
    ]
  },
];

export default routes;
