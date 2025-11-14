export function resolveEnv() {
  const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env)
    ? import.meta.env
    : ({} as ImportMetaEnv);

  const runtimeEnv = (typeof window !== 'undefined' && window.__ENV__)
    ? window.__ENV__
    : {};

  return {
    API_BASE_URL:
      runtimeEnv.VITE_API_BASE_URL ??
      viteEnv.VITE_API_BASE_URL ??
      'http://localhost:8080/api',
  } as const;
}
