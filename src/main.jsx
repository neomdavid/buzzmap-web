import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
      <ToastContainer
        position="top-center"
        newestOnTop
        toastClassName="text-sm"
        style={{ zIndex: "999999999999 !important" }}
      />
      <App />
  </Provider>
);
