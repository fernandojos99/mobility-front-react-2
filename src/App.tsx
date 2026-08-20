/** El orden de los providers es parte de la convención: sesión → datos → router. */
import { BrowserRouter } from "react-router-dom";
import { SesionProvider } from "./contexts/SesionContext";
import { DataProvider } from "./store/DataProvider";
import { AppRoutes } from "./routes/AppRoutes";
import "./styles/base.css";

export default function App() {
  return (
    <SesionProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </SesionProvider>
  );
}
