import { createRoot } from "react-dom/client";
import App from "./renderer/App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
