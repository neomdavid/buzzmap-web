import React from "react";
import { axe, toHaveNoViolations } from "jest-axe";
import DengueMapping from "../../pages/admin/DengueMapping.jsx";
import { renderWithProviders } from "../../test/test-utils.jsx";

expect.extend(toHaveNoViolations);

// Mock heavy/DOM-external pieces
jest.mock("../../components/Mapping/MapOnly.jsx", () => () => (
  <div data-testid="map-mock" />
));
jest.mock(
  "../../components/Skeletons/ClusterDetailsSkeleton",
  () => () => null
);
jest.mock("lucide-react", () => ({ InfoIcon: () => null }));

describe("DengueMapping accessibility", () => {
  beforeAll(() => {
    global.window.google = global.window.google || { maps: {} };
  });

  it("renders with no obvious a11y violations", async () => {
    const { container } = renderWithProviders(<DengueMapping />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
