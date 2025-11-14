interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string;
    };
  }
}

export {};
