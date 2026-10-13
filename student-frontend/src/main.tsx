import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StudentPage from "./pages/StudentPage";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StudentPage></StudentPage>
    </StrictMode>,
);
