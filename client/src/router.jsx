import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { PublicOnly, RequireAuth, RequireRole } from './components/guards';
import { ROLES } from './lib/types';
import loadable from './lib/loadable';
const Landing = loadable(() => import('./pages/Landing'));
const Register = loadable(() => import('./pages/Register'));
const Login = loadable(() => import('./pages/Login'));
const ForgotPassword = loadable(() => import('./pages/ForgotPassword'));
const ResetPassword = loadable(() => import('./pages/ResetPassword'));
const Dashboard = loadable(() => import('./pages/Dashboard'));
const Appointments = loadable(() => import('./pages/Appointments'));
const AppointmentDetail = loadable(() => import('./pages/AppointmentDetail'));
const Patients = loadable(() => import('./pages/Patients'));
const PatientDetail = loadable(() => import('./pages/PatientDetail'));
const Doctors = loadable(() => import('./pages/Doctors'));
const Records = loadable(() => import('./pages/Records'));
const Prescriptions = loadable(() => import('./pages/Prescriptions'));
const Lab = loadable(() => import('./pages/Lab'));
const Medicines = loadable(() => import('./pages/Medicines'));
const Staff = loadable(() => import('./pages/Staff'));
const Activity = loadable(() => import('./pages/Activity'));
const Settings = loadable(() => import('./pages/Settings'));
const Unauthorized = loadable(() => import('./pages/Unauthorized'));
const NotFound = loadable(() => import('./pages/NotFound'));
const admin = [ROLES.ADMIN];
const staffRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LABTECH];
const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/unauthorized', element: <Unauthorized /> },
          { path: '/settings', element: <Settings /> },
          {
            element: <RequireRole roles={staffRoles} />,
            children: [
              {
                element: (
                  <RequireRole
                    roles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]}
                  />
                ),
                children: [
                  { path: '/appointments', element: <Appointments /> },
                  { path: '/appointments/:id', element: <AppointmentDetail /> },
                  { path: '/patients', element: <Patients /> },
                  { path: '/patients/:id', element: <PatientDetail /> },
                ],
              },
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT]} />,
                children: [{ path: '/doctors', element: <Doctors /> }],
              },
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.DOCTOR]} />,
                children: [{ path: '/records', element: <Records /> }],
              },
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.PHARMACIST]} />,
                children: [{ path: '/prescriptions', element: <Prescriptions /> }],
              },
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.LABTECH]} />,
                children: [{ path: '/lab', element: <Lab /> }],
              },
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.PHARMACIST]} />,
                children: [{ path: '/medicines', element: <Medicines /> }],
              },
              {
                element: <RequireRole roles={admin} />,
                children: [
                  { path: '/staff', element: <Staff /> },
                  { path: '/activity', element: <Activity /> },
                ],
              },
            ],
          },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
export { router };
