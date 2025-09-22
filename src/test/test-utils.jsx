import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

// Supports either a store factory or a default export store
let storeModule;
try {
  storeModule = await import("../store/store");
} catch (_) {
  storeModule = {};
}

export function renderWithProviders(
  ui,
  { route = "/", preloadedState, store } = {}
) {
  let appStore = store;
  if (!appStore) {
    if (storeModule.setupStore) {
      appStore = storeModule.setupStore(preloadedState);
    } else if (storeModule.store) {
      appStore = storeModule.store;
    } else if (storeModule.default) {
      appStore = storeModule.default;
    } else {
      throw new Error("Could not resolve Redux store for tests");
    }
  }

  const Wrapper = ({ children }) => (
    <Provider store={appStore}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );
  return { store: appStore, ...render(ui, { wrapper: Wrapper }) };
}
