/**
 * ═══════════════════════════════════════════════════════════
 * VALIDATORS - Funciones de validación
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar DNI peruano (8 dígitos)
 */
export const isValidDNI = (dni: string): boolean => {
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

/**
 * Validar teléfono peruano (9 dígitos)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validar contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Obtener mensaje de error de contraseña
 */
export const getPasswordErrorMessage = (password: string): string | null => {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  return null;
};

/**
 * Validar nota (0-20)
 */
export const isValidGrade = (grade: number): boolean => {
  return grade >= 0 && grade <= 20;
};

/**
 * Validar fecha (no puede ser futura)
 */
export const isValidPastDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
};

/**
 * Validar fecha de nacimiento (mayor a 3 años, menor a 100 años)
 */
export const isValidBirthDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const age = today.getFullYear() - dateObj.getFullYear();

  return age >= 3 && age <= 100;
};

/**
 * Validar rango de fechas
 */
export const isValidDateRange = (startDate: string | Date, endDate: string | Date): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return start <= end;
};

/**
 * Validar URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar código de tenant (solo letras y números, 3-10 caracteres)
 */
export const isValidTenantCode = (code: string): boolean => {
  const codeRegex = /^[a-zA-Z0-9]{3,10}$/;
  return codeRegex.test(code);
};

/**
 * Validar campo requerido
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validar longitud mínima
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validar longitud máxima
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validar número en rango
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validar archivo (tipo y tamaño)
 */
export const isValidFile = (
  file: File,
  allowedTypes: string[],
  maxSizeInMB: number
): { valid: boolean; error?: string } => {
  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
    };
  }

  // Validar tamaño
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxSizeInMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * Validar código de estudiante (formato: EST-YYYY-NNNN)
 */
export const isValidStudentCode = (code: string): boolean => {
  const codeRegex = /^EST-\d{4}-\d{4}$/;
  return codeRegex.test(code);
};

/**
 * Validar RUC (11 dígitos)
 */
export const isValidRUC = (ruc: string): boolean => {
  const rucRegex = /^\d{11}$/;
  return rucRegex.test(ruc);
};

/**
 * Sanitizar input (remover caracteres especiales)
 */
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"]/g, '');
};

/**
 * Validar edad mínima
 */
export const hasMinimumAge = (birthDate: string | Date, minAge: number): boolean => {
  const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
};
