import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import {updateRelease} from './src/updateRelease.js';
const buildId=process.env.TAP_BUILD_ID||new Date().toISOString();
const release={...updateRelease,build:buildId};
export default defineConfig({
  base: "./",
  define:{__TAP_RELEASE__:JSON.stringify(release)},
  plugins: [
    react(),
    tailwindcss(),
    {name:'tap-update-metadata',generateBundle(){
      this.emitFile({type:'asset',fileName:'update-info.js',source:`self.addEventListener('message',event=>{if(event.data==='SPHERE_UPDATE_INFO')event.ports[0]?.postMessage(${JSON.stringify(release)})});`});
    }},
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["tap-app-icon.svg", "tap-apple-icon-v2.png"],
      manifest: {
        name: "Sphere Tap — No seu ritmo",
        short_name: "Sphere Tap",
        description: "Seus hábitos, gastos e metas, com privacidade.",
        theme_color: "#00372d",
        background_color: "#00372d",
        display: "standalone",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "tap-icon-192-v2.png", sizes: "192x192", type: "image/png" },
          {
            src: "tap-icon-512-v2.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: { maximumFileSizeToCacheInBytes:8*1024*1024,skipWaiting:false,clientsClaim:true,cleanupOutdatedCaches:true,importScripts:['./update-info.js'],globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2,otf}"] },
    }),
  ],
});
