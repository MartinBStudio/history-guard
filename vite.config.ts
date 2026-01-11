// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." } // manifest at root
      ]
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, "src/background.ts"),
        popup: path.resolve(__dirname, "src/popup/index.html")
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === "popup") return "src/popup/[name].js"; // <- put popup.js in popup folder
          return "[name].js"; // background.js stays in root
        },
        chunkFileNames: "src/popup/[name].js",  // any chunks of popup JS go here too
        assetFileNames: "src/popup/[name].[ext]" // CSS/images for popup go here
      }
    }
  }
});
