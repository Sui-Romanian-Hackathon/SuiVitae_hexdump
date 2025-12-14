import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Add this import for dapp-kit styles (this is likely the missing piece)
import "@mysten/dapp-kit/dist/index.css";

createRoot(document.getElementById("root")!).render(<App />);
