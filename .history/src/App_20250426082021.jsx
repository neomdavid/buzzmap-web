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
  ReportsVerification,
} from "./pages/admin";

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
          path: "/admin/dashboard",
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
          path: "/admin/cea",
          element: <CEA />,
        },
      ],
    },
    { path: "/superadmin", element: <Superadminlayout /> },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
