import "./App.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import {
  About,
  Community,
  Landing,
  LandingLayout,
  Mapping,
  Prevention,
  SpecificLocation,
  SignUp,
  Login,
  Otp,
  SingleArticle,
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
} from "./pages/admin";
import {
  SuperadminLayout,
  SprDashboard,
  SprUsers,
  SprAdmins,
} from "./pages/superadmin";

// Helper function to get user data
const getUserData = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Authentication components
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = getUserData();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = getUserData();

  // If user is logged in and tries to access public routes
  if (token && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "superadmin":
        return <Navigate to="/superadmin/dashboard" replace />;
      default:
        return <Navigate to="/home" replace />;
    }
  }

  return children;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/home" replace />,
        },
        {
          index: true,
          path: "/home",
          element: <Landing />,
        },
        {
          path: "/mapping",
          element: <Mapping />,
        },
        {
          path: "/mapping/:id",
          element: <SpecificLocation />,
        },
        {
          path: "/community",
          element: <Community />,
        },
        {
          path: "/prevention",
          element: <Prevention />,
        },
        {
          path: "/prevention/:id",
          element: <SingleArticle />,
        },
        {
          path: "/about",
          element: <About />,
        },
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
    {
      path: "/admin",
      element: (
        <PrivateRoute requiredRole="admin">
          <AdminLayout />
        </PrivateRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/admin/dashboard" replace />,
        },
        {
          path: "/admin/dashboard",
          index: true,
          element: <Dashboard />,
        },
        {
          path: "/admin/analytics",
          element: <Analytics />,
        },
        {
          path: "/admin/reportsverification",
          element: <ReportsVerification />,
        },
        {
          path: "/admin/denguemapping",
          element: <DengueMapping />,
        },
        {
          path: "/admin/interventions",
          element: <Interventions />,
        },
        {
          path: "/admin/interventions/all",
          element: <AllInterventions />,
        },
        {
          path: "/admin/cea",
          element: <CEA />,
        },
      ],
    },
    {
      path: "/superadmin",
      element: (
        <PrivateRoute requiredRole="superadmin">
          <SuperadminLayout />
        </PrivateRoute>
      ),
      children: [
        {
          path: "/superadmin/dashboard",
          element: <SprDashboard />,
        },
        {
          path: "/superadmin/users",
          element: <SprUsers />,
        },
        {
          path: "/superadmin/admins",
          element: <SprAdmins />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
