import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/app/",
  root: path.resolve("client"),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/auth": "http://127.0.0.1:3000",
      "/tasks": "http://127.0.0.1:3000",
      "/docs": "http://127.0.0.1:3000"
    }
  },
  build: {
    emptyOutDir: true,
    outDir: path.resolve("client/dist")
  }
});
