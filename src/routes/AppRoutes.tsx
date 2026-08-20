/** Rutas. La landing va FUERA del shell: es pública y tiene su propio lenguaje visual. */
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { LandingPage } from "../landing/LandingPage";
import { IntegracionesPage } from "../pages/IntegracionesPage";
import { GapActualPage } from "../pages/GapActualPage";
import { AspiracionesPage } from "../pages/AspiracionesPage";
import { CaminoPage } from "../pages/CaminoPage";
import { OportunidadesPage } from "../pages/OportunidadesPage";
import { GeneralistaPage } from "../pages/GeneralistaPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/yo" element={<IntegracionesPage />} />
        <Route path="/yo/gap" element={<GapActualPage />} />
        <Route path="/yo/aspiracion" element={<AspiracionesPage />} />
        <Route path="/yo/camino/:puestoId" element={<CaminoPage />} />
        <Route path="/oportunidades" element={<OportunidadesPage />} />
        <Route path="/generalista" element={<GeneralistaPage />} />
        <Route path="*" element={<Navigate to="/yo" replace />} />
      </Route>
    </Routes>
  );
}
