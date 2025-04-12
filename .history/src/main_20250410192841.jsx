import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./app/store";

createRoot(document.getElementById("root")).render(
  <Provider>
    <App />
  </Provider>
);
