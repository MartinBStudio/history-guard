import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "src/assets/*", dest: "assets" }
      ]
    })
  ],

  // Build config
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, "src/background.ts"),
        popup: path.resolve(__dirname, "src/popup/index.html"),
        options: path.resolve(__dirname, "src/options/index.html")
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "popup") return "src/popup/[name].js";
          if (chunk.name === "options") return "src/options/[name].js";
          return "[name].js"; // background.js
        },
        chunkFileNames: (chunk) => {
          if (chunk.name?.includes("popup")) return "src/popup/[name].js";
          if (chunk.name?.includes("options")) return "src/options/[name].js";
          return "[name].js";
        },
        assetFileNames: (chunk) => {
          if (chunk.name?.includes("popup")) return "src/popup/[name].[ext]";
          if (chunk.name?.includes("options")) return "src/options/[name].[ext]";
          return "[name].[ext]";
        }
      }
    }
  },

  // Dev server tweaks so you can serve both entries
  server: {
    fs: {
      // allow Vite to serve HTML/JS outside project root
      allow: ["src/popup", "src/options","src/shared","node_modules/bootstrap/dist/css"]
    },
    // Optional: you can set default port for popup dev
    port: 5173
  }
}));
