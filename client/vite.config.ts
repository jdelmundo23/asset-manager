import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const backendUrl = env.VITE_BACKEND_URL;

  if (!backendUrl) {
    throw new Error(
      "VITE_BACKEND_URL is missing. Set it in your `.env` file before building."
    );
  }

  return {
    plugins: [react(), nodePolyfills({ include: ["buffer"] })],
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
    server: {
      host: env.VITE_DEV_HOST === "true",
      port: 3000,
      proxy: {
        "/api": {
          target: `${env.VITE_BACKEND_URL}/api`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@shared": resolve(__dirname, "../shared"),
      },
    },
  };
});
