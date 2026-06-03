import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("associates label with input", () => {
    render(<FormField id="email" label="Email" type="email" placeholder="you@example.com" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });
});
