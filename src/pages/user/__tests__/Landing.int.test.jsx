import React from "react";
import { renderWithProviders } from "../../../test/test-utils";
import { screen, fireEvent } from "@testing-library/react";
import * as utils from "../../../utils.jsx";
import Landing from "../Landing";

describe("Landing integration (guest)", () => {
  it("shows info toast when guest clicks share input row", () => {
    const toastSpy = vi.spyOn(utils, "toastInfo").mockImplementation(() => {});

    // Ensure guest state (no persisted auth)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    renderWithProviders(<Landing />, { route: "/" });

    const input = screen.getByPlaceholderText(/login to share your report/i);
    // Click the container that has the onClick handler
    fireEvent.click(input.parentElement);

    expect(toastSpy).toHaveBeenCalledWith("Please log in to share your report");
    toastSpy.mockRestore();
  });
});
