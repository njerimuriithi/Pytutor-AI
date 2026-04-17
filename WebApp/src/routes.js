/**
 * Application Routes Configuration
 *
 * Defines all protected routes in the application using React lazy loading
 * for code splitting and performance optimization.
 *
 * Each route object contains:
 * - path: URL path for the route
 * - name: Human-readable name for breadcrumbs
 * - element: Lazy-loaded React component
 * - exact: (optional) Requires exact path match
 *
 * @module routes
 */

import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
//const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Courses = React.lazy(() => import('./views/Learn/Courses'))
const Assesments = React.lazy(() => import('./views/Learn/Assesments/Assesments'))
const Questions = React.lazy(() => import('./views/Learn/Assesments/Questions'))
const StudentDashboard = React.lazy(() => import('./views/dashboard/StudentDashboard'))
const StudentChart = React.lazy(() => import('./views/dashboard/StudentChart'))


/**
 * Array of route configuration objects
 *
 * @type {Array<Object>}
 * @property {string} path - URL path pattern
 * @property {string} name - Display name for breadcrumbs and navigation
 * @property {React.LazyExoticComponent} element - Lazy-loaded component
 * @property {boolean} [exact] - Whether to match path exactly
 *
 * @example
 * // Route renders when URL matches '/dashboard'
 * { path: '/dashboard', name: 'Dashboard', element: Dashboard }
 *
 * @example
 * // Route with exact match required
 * { path: '/base', name: 'Base', element: Cards, exact: true }
 */
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/Learn', name: 'Learn', element: Courses, exact: true },
  { path: '/Learn/Courses', name: 'Courses', element: Courses ,exact: true },
  { path: '/Learn/Assesments/Assesments', name: 'Assesments', element: Assesments },
  { path: '/Learn/Assesments/Questions', name: 'Questions', element: Questions },
  { path: '/dashboard/StudentDashboard', name: 'StudentDashboard', element: StudentDashboard },
  {
    path: '/StudentChart/:studentId',
    name: 'Student Chart',
    element: StudentChart,
  },

]

export default routes
