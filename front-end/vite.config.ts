import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:6281",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:6281",
        ws: true, // 🔥 REQUIRED
        changeOrigin: true,
      },
    },
  },
});
