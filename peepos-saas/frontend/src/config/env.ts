/**
 * ═══════════════════════════════════════════════════════════
 * ENV CONFIG - Configuración de variables de entorno
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Obtener variable de entorno con validación
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];

  if (!value && !defaultValue) {
    console.warn(`⚠️ Variable de entorno ${key} no está definida`);
    return '';
  }

  return value || defaultValue || '';
};

/**
 * Configuración de la aplicación
 */
export const ENV_CONFIG = {
  // API
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
  API_TIMEOUT: 30000,

  // App
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Peepos SaaS'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),

  // Modo de desarrollo
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,

  // Features (pueden ser controladas por variables de entorno)
  FEATURES: {
    ENABLE_AI_IMPORT: getEnvVar('VITE_ENABLE_AI_IMPORT', 'true') === 'true',
    ENABLE_WHATSAPP: getEnvVar('VITE_ENABLE_WHATSAPP', 'true') === 'true',
    ENABLE_QR_ATTENDANCE: getEnvVar('VITE_ENABLE_QR_ATTENDANCE', 'true') === 'true',
    ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  },
} as const;

/**
 * Validar configuración crítica
 */
export const validateEnvConfig = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);

  if (missing.length > 0 && ENV_CONFIG.IS_PROD) {
    console.error('🚨 Variables de entorno faltantes:', missing);
    console.warn('⚠️ Usando valores por defecto. Esto puede causar problemas en producción.');
  }
};

// Validar al importar
validateEnvConfig();

export default ENV_CONFIG;
