import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Point d'entrée React 18+ (compatible Vercel, Firebase, etc.)
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
