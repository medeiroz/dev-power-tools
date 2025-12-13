import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Registra o service worker para funcionalidade offline
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("Nova versão disponível. Atualizando...");
  },
  onOfflineReady() {
    console.log("App pronto para uso offline!");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
