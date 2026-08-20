import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A diferencia de Radar, aquí sí se monta el plugin de React: sin él no hay Fast Refresh y cada
// cambio recarga la página entera, que en el mapa significa perder la posición del scroll.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
