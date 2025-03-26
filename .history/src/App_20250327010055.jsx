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
} from "./pages";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingLayout />,
      children: [
        // {
        //   index: true,
        //   element: <Navigate to="/home" replace />,
        // },
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
  ]);
  return <RouterProvider router={router} />;
}

export default App;
