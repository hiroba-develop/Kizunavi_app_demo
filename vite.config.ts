import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

/** GitHub Pages は存在しないパスに 404.html を返す。SPA のディープリンク用に index と同一にする。 */
function githubPagesSpaFallback() {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  base: "/Kizunavi_app_demo/",
  publicDir: "public",
  server: {
    port: 5173,
    allowedHosts: ["localhost:5173", "35.74.40.37:5173", "product.jp"],
  },
});
