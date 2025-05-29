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
  ForgotPassword,
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
import ActivePosts from './pages/admin/CEA/ActivePosts';
import ArchivedAdminPosts from './pages/admin/CEA/ArchivedAdminPosts';
import ArchivedUsers from './pages/superadmin/ArchivedUsers';
import ArchivedAdmins from './pages/superadmin/ArchivedAdmins';

// Helper functions
const getUserData = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  console.log("[DEBUG] getUserData - user from storage:", user);
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  console.log("[DEBUG] isAuthenticated - user from storage:", user);
  console.log("[DEBUG] isAuthenticated - token from storage:", token);
  return user !== null && token !== null;
};

// Route protection components
const PublicRoute = ({ children }) => {
  return children;
};

const PrivateRoute = ({ children, requiredRole }) => {
  const user = getUserData();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  console.log("[DEBUG] PrivateRoute - Required Role:", requiredRole);
  console.log("[DEBUG] PrivateRoute - User from storage:", user);
  console.log("[DEBUG] PrivateRoute - Token from storage:", token);

  // If no user data in storage, redirect to login regardless of token
  if (!user) {
    console.log("[DEBUG] PrivateRoute - No user data found, redirecting to login");
    // Clear any existing token since it's invalid without user data
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    toastError(`Please log in to access this page.`);
    return <Navigate to="/login" replace />;
  }

  // For admin/superadmin routes, check both user data and token
  if (requiredRole === "admin" || requiredRole === "superadmin") {
    // First check user role from storage
    if (user.role !== requiredRole) {
      console.log("[DEBUG] PrivateRoute - User role mismatch:", user.role, "!=", requiredRole);
      toastError("You don't have permission to access this page.");
      return <Navigate to="/login" replace />;
    }

    // Then verify token
    if (!token) {
      console.log("[DEBUG] PrivateRoute - No token found for admin/superadmin");
      toastError("Please log in to access this page.");
      return <Navigate to="/login" replace />;
    }

    try {
      // Decode the JWT token to get the role
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log("[DEBUG] PrivateRoute - Token payload:", tokenPayload);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenPayload.exp < currentTime) {
        console.log("[DEBUG] PrivateRoute - Token expired");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        toastError("Your session has expired. Please log in again.");
        return <Navigate to="/login" replace />;
      }
      
      // Verify token role matches user role
      if (tokenPayload.role !== user.role) {
        console.log("[DEBUG] PrivateRoute - Token role mismatch with user role");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        toastError("Invalid session. Please log in again.");
        return <Navigate to="/login" replace />;
      }
    } catch (error) {
      console.error("[DEBUG] PrivateRoute - Error decoding token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      toastError("Invalid session. Please log in again.");
      return <Navigate to="/login" replace />;
    }
  }

  // For user role, just verify user exists and role matches
  if (requiredRole === "user" && user.role !== "user") {
    console.log("[DEBUG] PrivateRoute - User role mismatch:", user.role, "!=", "user");
    toastError("You don't have permission to access this page.");
    return <Navigate to="/login" replace />;
  }

  // If we get here, the user is authenticated and has the correct role
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
    // Auth routes
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
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
      path: "/forgot-password",
      element: (
        <PublicRoute>
          <ForgotPassword />
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
        { 
          path: "/admin/cea",
          element: <CEA />,
          children: [
            { index: true, element: <ActivePosts /> },
            { path: "ap/archives", element: <ArchivedAdminPosts /> }
          ]
        },
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
        { index: true, element: <Navigate to="/superadmin/users" replace /> },
        { path: "/superadmin/users", element: <SprUsers /> },
        { path: "/superadmin/users/archives", element: <ArchivedUsers /> },
        { path: "/superadmin/admins", element: <SprAdmins /> },
        { path: "/superadmin/admins/archives", element: <ArchivedAdmins /> },
      ],
    },

    // Search results route
    {
      path: "/search",
      element: <SearchResults />,
    },

    // Fallback route - must be last
    { path: "*", element: <Navigate to="/home" replace /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
