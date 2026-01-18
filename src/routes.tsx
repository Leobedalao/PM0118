import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import CheckInPage from './pages/CheckInPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />
  },
  {
    name: 'Tasks',
    path: '/tasks',
    element: <TasksPage />
  },
  {
    name: 'CheckIns',
    path: '/check-ins',
    element: <CheckInPage />
  }
];

export default routes;
