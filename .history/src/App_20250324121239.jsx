import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { About, LandingLayout } from "./pages";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingLayout />,
      children: [
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
