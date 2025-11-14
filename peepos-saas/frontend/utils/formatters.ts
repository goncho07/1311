/**
 * ═══════════════════════════════════════════════════════════
 * FORMATTERS - Funciones de formateo de datos
 * ═══════════════════════════════════════════════════════════
 */

import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear fecha a formato legible
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formatear fecha relativa (hace X tiempo)
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return '';
  }
};

/**
 * Formatear moneda
 */
export const formatCurrency = (amount: number, currency: string = 'PEN'): string => {
  try {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency,
    });
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formateando moneda:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Formatear número con decimales
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatear nota (0-20)
 */
export const formatGrade = (grade: number): string => {
  return grade.toFixed(2);
};

/**
 * Formatear DNI
 */
export const formatDNI = (dni: string): string => {
  return dni.replace(/(\d{8})/, '$1');
};

/**
 * Formatear teléfono
 */
export const formatPhone = (phone: string): string => {
  // Formato: 999 999 999
  return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno?: string
): string => {
  return `${nombre} ${apellidoPaterno} ${apellidoMaterno || ''}`.trim();
};

/**
 * Truncar texto
 */
export const truncate = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convertir a título (cada palabra con mayúscula inicial)
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatear estado con color
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    activo: 'green',
    inactivo: 'gray',
    suspendido: 'red',
    pendiente: 'yellow',
    pagado: 'green',
    vencido: 'red',
    presente: 'green',
    ausente: 'red',
    tardanza: 'yellow',
    justificado: 'blue',
  };

  return statusColors[status.toLowerCase()] || 'gray';
};

/**
 * Obtener iniciales de un nombre
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
