import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initInstallTracking } from "@/lib/installTrackingService";

initInstallTracking();

createRoot(document.getElementById("root")!).render(<App />);
