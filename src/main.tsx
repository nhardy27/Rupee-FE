// Entry point of the React application
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Mount the React app to the DOM element with id "root"
createRoot(document.getElementById("root")!).render(<App />);
  