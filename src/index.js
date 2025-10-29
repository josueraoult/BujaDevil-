// src/index.js
// Point d'entrée React pour BujaDevil Blog – ultra-complet, prêt pour Vercel/Firebase, Tailwind, et thème dark moderne.

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Tailwind + custom styles
import App from "./App";

// Pour l'accessibilité, forcer le dark mode sur <html>
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
  document.body.classList.add("dark");
  document.body.style.background = "#101010";
}

// (Optionnel) Fix pour Vercel analytics ou custom scripts
// import { inject } from "@vercel/analytics"; inject();

const container = document.getElementById("root");

// Gestion du root React 18+
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) pour dev local (CRA, Vite, Parcel)
if (import.meta && import.meta.hot) {
  import.meta.hot.accept();
}

// Gestion du scroll automatique (simulateur de navigation SPA)
window.onhashchange = () => {
  const el = document.getElementById(window.location.hash.replace("#", ""));
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

// Sécurité supplémentaire pour éviter le drag & drop de fichiers sur le body
window.addEventListener("dragover", function(e) { e.preventDefault(); }, false);
window.addEventListener("drop", function(e) { e.preventDefault(); }, false);

// (Optionnel) Splash screen removal (si loader custom en HTML)
window.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  if (loader) loader.style.display = "none";
});

// (Optionnel) Service worker registration (PWA-ready)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {/* ignore if not present */});
  });
}
