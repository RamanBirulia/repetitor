import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders without crashing", () => {
  render(<App />);
});

test("renders home page with main heading", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /🎓 Repetitor/i });
  expect(heading).toBeInTheDocument();
});

test("renders choose your learning adventure text", () => {
  render(<App />);
  const adventureText = screen.getByText(/Choose Your Learning Adventure/i);
  expect(adventureText).toBeInTheDocument();
});

test("renders article master game card", () => {
  render(<App />);
  const articleMaster = screen.getByRole("heading", {
    name: /Article Master/i,
  });
  expect(articleMaster).toBeInTheDocument();
});

test("renders start game button", () => {
  render(<App />);
  const startButton = screen.getByRole("button", { name: /Start Game/i });
  expect(startButton).toBeInTheDocument();
});
