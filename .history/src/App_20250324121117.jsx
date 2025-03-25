import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LandingLayout } from "./pages";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingLayout />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
