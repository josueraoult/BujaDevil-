// src/index.js
// Point d'entrée React pour BujaDevil Blog – ultra-complet, prêt pour Vercel/Firebase, Tailwind, et thème dark moderne.
// Version améliorée avec correctifs, sécurité, accessibilité, et fonctionnalités avancées.

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Tailwind + custom styles
import App from "./App";

// Assure le rendu dès que DOM prêt pour éviter bug de root null
function startReactApp() {
  const container = document.getElementById("root");
  if (!container) {
    // Si le container n'existe pas, essaie à nouveau (cas rare build async)
    setTimeout(startReactApp, 50);
    return;
  }

  // Pour l'accessibilité et le thème, force le dark mode sur <html>
  document.documentElement.classList.add("dark");
  document.body.classList.add("dark");
  document.body.style.background = "#101010";

  // Rend l'app React
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startReactApp);
} else {
  startReactApp();
}

// Hot Module Replacement (HMR) pour dev local (CRA, Vite, Parcel)
if (import.meta && import.meta.hot) {
  import.meta.hot.accept();
}

// Gestion du scroll automatique (simulateur de navigation SPA)
window.onhashchange = () => {
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
};

// Sécurité supplémentaire pour éviter le drag & drop de fichiers sur le body
window.addEventListener("dragover", function (e) {
  e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
  e.preventDefault();
}, false);

// Splash screen removal (si loader custom en HTML, robustifié)
window.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  if (loader) loader.style.display = "none";
});

// Service worker registration (PWA-ready), check if sw.js exists
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    fetch("/sw.js", { method: "HEAD" }).then(res => {
      if (res.ok) {
        navigator.serviceWorker.register("/sw.js").catch(() => { /* ignore */ });
      }
    });
  });
}

// FONCTIONNALITÉS SUPPLÉMENTAIRES UTILES

// Focus visible pour accessibilité clavier
document.addEventListener("keydown", e => {
  if (e.key === "Tab") document.body.classList.add("user-is-tabbing");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("user-is-tabbing");
});

// Ajout d'un observer pour dark mode système (si utilisateur change son OS)
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.style.background = "#101010";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.style.background = "#f6f6f6";
    }
  });
}
