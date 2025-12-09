import path from "path"
import fs from "fs"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const ReactCompilerConfig = {
  /* ... */
};

// Check if SSL certificates exist
const certKeyPath = path.resolve(__dirname, 'localhost-key.pem');
const certPath = path.resolve(__dirname, 'localhost.pem');
const hasCerts = fs.existsSync(certKeyPath) && fs.existsSync(certPath);

// HTTPS configuration (only if certificates exist)
const httpsConfig = hasCerts ? {
  key: fs.readFileSync(certKeyPath),
  cert: fs.readFileSync(certPath),
} : undefined;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        ["babel-plugin-react-compiler", ReactCompilerConfig],
      ],
    },
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: httpsConfig,
    port: 5173,
    host: true, // Allow access from network
  },
})
