import { defineConfig, loadEnv } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "localhost",
      port: env.APP_PORT || 8000,
    },
    plugins: [createVuePlugin()],
  };
});
