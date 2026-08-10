import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { PublicOnly, RequireAuth, RequireRole } from './components/guards';
import { ROLES } from './lib/types';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Doctors from './pages/Doctors';
import Records from './pages/Records';
import Prescriptions from './pages/Prescriptions';
import Lab from './pages/Lab';
import Medicines from './pages/Medicines';
import Staff from './pages/Staff';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const admin = [ROLES.ADMIN];
const staffRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LABTECH];

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
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
          { path: '/', element: <Dashboard /> },
          { path: '/unauthorized', element: <Unauthorized /> },
          { path: '/settings', element: <Settings /> },
          {
            element: <RequireRole roles={staffRoles} />,
            children: [
              {
                element: <RequireRole roles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]} />,
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
