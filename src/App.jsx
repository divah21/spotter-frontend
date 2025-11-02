import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import HomePage from './pages/Home'
import TripPlannerPage from './pages/TripPlanner'
import ResultsPage from './pages/Results'
import LoginPage from './pages/auth/Login'
import SignupPage from './pages/auth/Signup'
import ProtectedRoute from './components/ProtectedRoute'

// Layout Components
import AdminLayout from './components/AdminLayout'
import DriverLayout from './components/DriverLayout'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminDrivers from './pages/admin/Drivers'
import AdminTrips from './pages/admin/Trips'
import AdminTripDetail from './pages/admin/TripDetail'
import AdminLogs from './pages/admin/Logs'
import AdminSettings from './pages/admin/Settings'

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard'
import DriverTrips from './pages/driver/Trips'
import DriverTripDetail from './pages/driver/TripDetail'
import DriverLogs from './pages/driver/Logs'
import DriverSettings from './pages/driver/Settings'
import NewTrip from './pages/driver/NewTrip'

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

// Error component
const ErrorPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-gray-600 mb-4">Something went wrong.</p>
      <a href="/" className="text-primary hover:underline">Go back home</a>
    </div>
  </div>
)

// Not Found component
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-4">Page not found</p>
      <a href="/" className="text-primary hover:underline">Go back home</a>
    </div>
  </div>
)

function App() {
  const router = createBrowserRouter([
    // Public routes
    {
      path: '/',
      element: <HomePage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/planner',
      element: <TripPlannerPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/results',
      element: <ResultsPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/login',
      element: <LoginPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: '/signup',
      element: <SignupPage />,
      errorElement: <ErrorPage />,
    },

    // Admin routes with layout
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/admin/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <AdminDashboard />,
        },
        {
          path: 'drivers',
          element: <AdminDrivers />,
        },
        {
          path: 'trips',
          element: <AdminTrips />,
        },
        {
          path: 'trips/:id',
          element: <AdminTripDetail />,
        },
        {
          path: 'logs',
          element: <AdminLogs />,
        },
        {
          path: 'settings',
          element: <AdminSettings />,
        },
      ],
    },

    // Driver routes with layout
    {
      path: '/driver',
      element: (
        <ProtectedRoute allowedRoles={['driver']}>
          <DriverLayout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/driver/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <DriverDashboard />,
        },
        {
          path: 'trips',
          element: <DriverTrips />,
        },
        {
          path: 'trips/:id',
          element: <DriverTripDetail />,
        },
        {
          path: 'trips/new',
          element: <NewTrip />,
        },
        {
          path: 'planner',
          element: <TripPlannerPage />,
        },
        {
          path: 'results',
          element: <ResultsPage />,
        },
        {
          path: 'logs',
          element: <DriverLogs />,
        },
        {
          path: 'settings',
          element: <DriverSettings />,
        },
      ],
    },

    // 404 catch-all
    {
      path: '*',
      element: <NotFound />,
    },
  ])

  return <RouterProvider router={router} />
}

export default App
