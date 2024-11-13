import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  server: {
    port: 3000,
    hmr: {
      timeout: 60000,
    },
  },
  plugins: [react()],
});

