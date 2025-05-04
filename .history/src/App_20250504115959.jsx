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
} from "./pages/user";
import {
  AdminLayout,
  Analytics,
  CEA,
  Dashboard,
  DengueMapping,
  Interventions,
  ReportsVerification,
} from "./pages/admin";
import {
  SuperadminLayout,
  SprDashboard,
  SprUsers,
  SprAdmins,
} from "./pages/superadmin";

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
          path: "/about",
          element: <About />,
        },
      ],
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/otp",
      element: <Otp />,
    },
    {
      path: "/admin",
      element: <AdminLayout />,
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
          path: "/admin/cea",
          element: <CEA />,
        },
      ],
    },
    {
      path: "/superadmin",
      element: <SuperadminLayout />,
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
