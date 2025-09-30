import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Runtime fixer for unsupported <menu> elements in non-Firefox browsers
function replaceMenus(root = document) {
  try {
    const menus = root.querySelectorAll ? root.querySelectorAll("menu") : [];
    menus.forEach((menu) => {
      const ul = document.createElement("ul");
      // Copy attributes
      for (const { name, value } of Array.from(menu.attributes)) {
        ul.setAttribute(name, value);
      }
      // Move children
      while (menu.firstChild) ul.appendChild(menu.firstChild);
      menu.replaceWith(ul);
    });
  } catch {}
}

// Run once on load and observe future DOM changes
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => replaceMenus());
  } else {
    replaceMenus();
  }
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of Array.from(m.addedNodes)) {
        if (n && n.nodeType === 1) {
          if (n.tagName && n.tagName.toLowerCase() === "menu") {
            replaceMenus(n.parentNode || document);
          } else {
            replaceMenus(n);
          }
        }
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// Register service worker for better caching (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ToastContainer
      position="top-center"
      newestOnTop
      toastClassName="text-sm"
      className="z-[99999999999]"
      style={{ zIndex: 9999999999 }}
    />
    <App />
  </Provider>
);
