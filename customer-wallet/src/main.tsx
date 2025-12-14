import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Add dapp-kit styles for wallet connection UI
import "@mysten/dapp-kit/dist/index.css";

createRoot(document.getElementById("root")!).render(<App />);
