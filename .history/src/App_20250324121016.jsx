import { useState } from "react";
import "./App.css";
import { createBrowserRouter } from "react-router-dom";
import { LandingLayout } from "./pages";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingLayout />,
    },
  ]);
}

export default App;
