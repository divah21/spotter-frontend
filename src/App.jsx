import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/Home'))
const TripPlannerPage = lazy(() => import('./pages/TripPlanner'))
const ResultsPage = lazy(() => import('./pages/Results'))
const LoginPage = lazy(() => import('./pages/auth/Login'))
const SignupPage = lazy(() => import('./pages/auth/Signup'))

const AdminLayout = lazy(() => import('./components/AdminLayout'))
const DriverLayout = lazy(() => import('./components/DriverLayout'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminDrivers = lazy(() => import('./pages/admin/Drivers'))
const AdminTrips = lazy(() => import('./pages/admin/Trips'))
const AdminTripDetail = lazy(() => import('./pages/admin/TripDetail'))
const AdminLogs = lazy(() => import('./pages/admin/Logs'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

const DriverDashboard = lazy(() => import('./pages/driver/Dashboard'))
const DriverTrips = lazy(() => import('./pages/driver/Trips'))
const DriverTripDetail = lazy(() => import('./pages/driver/TripDetail'))
const DriverLogs = lazy(() => import('./pages/driver/Logs'))
const DriverSettings = lazy(() => import('./pages/driver/Settings'))
const NewTrip = lazy(() => import('./pages/driver/NewTrip'))

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

const ErrorPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-gray-600 mb-4">Something went wrong.</p>
      <a href="/" className="text-primary hover:underline">Go back home</a>
    </div>
  </div>
)

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
    
    {
      path: '/',
      element: (
        <Suspense fallback={<Loading />}>
          <HomePage />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/planner',
      element: (
        <Suspense fallback={<Loading />}>
          <TripPlannerPage />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/results',
      element: (
        <Suspense fallback={<Loading />}>
          <ResultsPage />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<Loading />}>
          <LoginPage />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/signup',
      element: (
        <Suspense fallback={<Loading />}>
          <SignupPage />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },

    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<Loading />}>
            <AdminLayout />
          </Suspense>
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
          element: (
            <Suspense fallback={<Loading />}>
              <AdminDashboard />
            </Suspense>
          ),
        },
        {
          path: 'drivers',
          element: (
            <Suspense fallback={<Loading />}>
              <AdminDrivers />
            </Suspense>
          ),
        },
        {
          path: 'trips',
          element: (
            <Suspense fallback={<Loading />}>
              <AdminTrips />
            </Suspense>
          ),
        },
        {
          path: 'trips/:id',
          element: (
            <Suspense fallback={<Loading />}>
              <AdminTripDetail />
            </Suspense>
          ),
        },
        {
          path: 'logs',
          element: (
            <Suspense fallback={<Loading />}>
              <AdminLogs />
            </Suspense>
          ),
        },
        {
          path: 'settings',
          element: (
            <Suspense fallback={<Loading />}>
              <AdminSettings />
            </Suspense>
          ),
        },
      ],
    },

    {
      path: '/driver',
      element: (
        <ProtectedRoute allowedRoles={['driver']}>
          <Suspense fallback={<Loading />}>
            <DriverLayout />
          </Suspense>
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
          element: (
            <Suspense fallback={<Loading />}>
              <DriverDashboard />
            </Suspense>
          ),
        },
        {
          path: 'trips',
          element: (
            <Suspense fallback={<Loading />}>
              <DriverTrips />
            </Suspense>
          ),
        },
        {
          path: 'trips/:id',
          element: (
            <Suspense fallback={<Loading />}>
              <DriverTripDetail />
            </Suspense>
          ),
        },
        {
          path: 'trips/new',
          element: (
            <Suspense fallback={<Loading />}>
              <NewTrip />
            </Suspense>
          ),
        },
        {
          path: 'planner',
          element: (
            <Suspense fallback={<Loading />}>
              <TripPlannerPage />
            </Suspense>
          ),
        },
        {
          path: 'results',
          element: (
            <Suspense fallback={<Loading />}>
              <ResultsPage />
            </Suspense>
          ),
        },
        {
          path: 'logs',
          element: (
            <Suspense fallback={<Loading />}>
              <DriverLogs />
            </Suspense>
          ),
        },
        {
          path: 'settings',
          element: (
            <Suspense fallback={<Loading />}>
              <DriverSettings />
            </Suspense>
          ),
        },
      ],
    },

    {
      path: '*',
      element: <NotFound />,
    },
  ])

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
