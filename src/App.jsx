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
} from "./pages/user";
import { AdminLayout, Dashboard } from "./pages/admin";

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
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "/admin/dashboard",
          element: <Dashboard />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
