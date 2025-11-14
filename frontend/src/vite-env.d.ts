/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Agregar más variables de entorno según sea necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
