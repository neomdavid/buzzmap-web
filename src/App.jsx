import "./App.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import {
  About,
  Community,
  Landing,
  LandingLayout,
  Mapping,
  BuzzLine,
  SpecificLocation,
  SignUp,
  Login,
  Otp,
  SingleArticle,
  Updates,
  Articles,
} from "./pages/user";
import {
  AdminLayout,
  Analytics,
  CEA,
  Dashboard,
  DengueMapping,
  Interventions,
  ReportsVerification,
  AllInterventions,
  InterventionEffectivity,
} from "./pages/admin";
import {
  SuperadminLayout,
  SprDashboard,
  SprUsers,
  SprAdmins,
} from "./pages/superadmin";
import { toastError } from "./utils.jsx";
import ErrorPage from "./pages/ErrorPage";
import SearchResults from './pages/user/SearchResults';

// Helper functions
const getUserData = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Route protection components
const PublicRoute = ({ children }) => {
  return children;
};

const PrivateRoute = ({ children, requiredRole }) => {
  if (!isAuthenticated()) {
    toastError(`Please log in as ${requiredRole} to access ${requiredRole}.`);
    return <Navigate to="/login" replace />;
  }

  const user = getUserData();
  if (requiredRole && user?.role !== requiredRole) {
    toastError("You don't have permission to access this page.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const router = createBrowserRouter([
    // Public routes
    {
      path: "/",
      element: <LandingLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Navigate to="/home" replace /> },
        { path: "/home", element: <Landing /> },
        { path: "/mapping", element: <Mapping /> },
        { path: "/mapping/:id", element: <SpecificLocation /> },
        { path: "/community", element: <Community /> },
        { path: "/buzzline", element: <BuzzLine /> },
        { path: "/buzzline/updates", element: <Updates /> },
        { path: "/buzzline/articles", element: <Articles /> },
        { path: "/buzzline/:id", element: <SingleArticle /> },
        { path: "/about", element: <About /> },
      ],
    },
    {
      path: "/signup",
      element: (
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/otp",
      element: (
        <PublicRoute>
          <Otp />
        </PublicRoute>
      ),
    },

    // Admin routes
    {
      path: "/admin",
      element: (
        <PrivateRoute requiredRole="admin">
          <AdminLayout />
        </PrivateRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/admin/dashboard" replace /> },
        { path: "/admin/dashboard", element: <Dashboard /> },
        { path: "/admin/analytics", element: <Analytics /> },
        {
          path: "/admin/reportsverification",
          element: <ReportsVerification />,
        },
        { path: "/admin/denguemapping", element: <DengueMapping /> },
        { path: "/admin/interventions", element: <Interventions /> },
        { path: "/admin/interventions/all", element: <AllInterventions /> },
        { path: "/admin/interventions/e", element: <InterventionEffectivity /> },
        { path: "/admin/cea", element: <CEA /> },
      ],
    },

    // Superadmin routes
    {
      path: "/superadmin",
      element: (
        <PrivateRoute requiredRole="superadmin">
          <SuperadminLayout />
        </PrivateRoute>
      ),
      children: [
        { path: "/superadmin/dashboard", element: <SprDashboard /> },
        { path: "/superadmin/users", element: <SprUsers /> },
        { path: "/superadmin/admins", element: <SprAdmins /> },
      ],
    },

    // Search results route
    {
      path: "/search",
      element: <SearchResults />,
    },

    // Fallback route
    { path: "*", element: <Navigate to="/home" replace /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
