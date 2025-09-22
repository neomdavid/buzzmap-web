import React from "react";
import { render, screen } from "@testing-library/react";
import Heading from "../Heading.jsx";

describe("Heading", () => {
  it("renders highlighted parts between slashes", () => {
    render(<Heading text="Buzzing /with awareness/" />);
    expect(screen.getByText(/with awareness/i)).toBeInTheDocument();
  });
});
