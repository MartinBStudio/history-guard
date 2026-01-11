import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." } // copy manifest to dist root
      ]
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, "src/background.ts"),
        popup: path.resolve(__dirname, "src/popup/index.html"),
        options: path.resolve(__dirname, "src/options/index.html") // <-- added options
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "popup") return "src/popup/[name].js";   // popup bundle
          if (chunk.name === "options") return "src/options/[name].js"; // options bundle
          return "[name].js"; // background.js
        },
        chunkFileNames: (chunk) => {
          if (chunk.name === "popup") return "src/popup/[name].js";
          if (chunk.name === "options") return "src/options/[name].js";
          return "[name].js";
        },
        assetFileNames: (chunk) => {
          if (chunk.name?.includes("popup")) return "src/popup/[name].[ext]";
          if (chunk.name?.includes("options")) return "src/options/[name].[ext]";
          return "[name].[ext]";
        },
      },
    },
  },
});
