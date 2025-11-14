import { create } from 'zustand';

const DEFAULT_LOGIN_IMAGE = '/assets/images/login-bg.png';
const DEFAULT_LOGIN_LOGO = '/assets/images/login-logo.png';
const DEFAULT_SIDEBAR_LOGO = '/assets/images/sidebar-logo.png';
const DEFAULT_CARNET_PATTERN = '/assets/images/carnet-pattern.png';

interface GradientColors {
  from: string;
  to: string;
}

interface SettingsState {
  loginImageUrl: string;
  loginLogoUrl: string;
  sidebarLogoUrl: string;
  carnetPatternUrl: string;
  carnetHeaderGradientInicial: GradientColors;
  carnetHeaderGradientPrimaria: GradientColors;
  carnetHeaderGradientSecundaria: GradientColors;
  uiFontFamily: string;
  carnetFontFamily: string;
  setLoginImageUrl: (url: string) => void;
  setLoginLogoUrl: (url: string) => void;
  setSidebarLogoUrl: (url: string) => void;
  setCarnetPatternUrl: (url: string) => void;
  setCarnetHeaderGradient: (level: 'Inicial' | 'Primaria' | 'Secundaria', colors: GradientColors) => void;
  setUiFontFamily: (font: string) => void;
  setCarnetFontFamily: (font: string) => void;
}

const getInitialValue = (key: string, defaultValue: any): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return defaultValue;
  }
};

const setPersistentValue = (key: string, value: any, defaultValue?: any) => {
  try {
    const valueToStore = value || defaultValue;
    localStorage.setItem(key, JSON.stringify(valueToStore));
    return valueToStore;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
    return value; // return original value on error
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  loginImageUrl: getInitialValue('settings:login-image-url', DEFAULT_LOGIN_IMAGE),
  loginLogoUrl: getInitialValue('settings:login-logo-url', DEFAULT_LOGIN_LOGO),
  sidebarLogoUrl: getInitialValue('settings:sidebar-logo-url', DEFAULT_SIDEBAR_LOGO),
  carnetPatternUrl: getInitialValue('settings:carnet-pattern-url', DEFAULT_CARNET_PATTERN),
  carnetHeaderGradientInicial: getInitialValue('settings:carnet-gradient-inicial', { from: '#e4ca40', to: '#d4b828' }),
  carnetHeaderGradientPrimaria: getInitialValue('settings:carnet-gradient-primaria', { from: '#fc0002', to: '#c6161b' }),
  carnetHeaderGradientSecundaria: getInitialValue('settings:carnet-gradient-secundaria', { from: '#117982', to: '#0b3e42' }),
  uiFontFamily: getInitialValue('settings:ui-font-family', 'Poppins'),
  carnetFontFamily: getInitialValue('settings:carnet-font', 'Chau Philomene One'),

  setLoginImageUrl: (url: string) => {
    const newUrl = setPersistentValue('settings:login-image-url', url, DEFAULT_LOGIN_IMAGE);
    set({ loginImageUrl: newUrl });
  },

  setLoginLogoUrl: (url: string) => {
    const newUrl = setPersistentValue('settings:login-logo-url', url, DEFAULT_LOGIN_LOGO);
    set({ loginLogoUrl: newUrl });
  },

  setSidebarLogoUrl: (url: string) => {
    const newUrl = setPersistentValue('settings:sidebar-logo-url', url, DEFAULT_SIDEBAR_LOGO);
    set({ sidebarLogoUrl: newUrl });
  },

  setCarnetPatternUrl: (url: string) => {
    const newUrl = setPersistentValue('settings:carnet-pattern-url', url, DEFAULT_CARNET_PATTERN);
    set({ carnetPatternUrl: newUrl });
  },
  
  setCarnetHeaderGradient: (level, colors) => {
    const keyMap = {
      'Inicial': 'carnetHeaderGradientInicial',
      'Primaria': 'carnetHeaderGradientPrimaria',
      'Secundaria': 'carnetHeaderGradientSecundaria',
    };
    const storageKey = `settings:carnet-gradient-${level.toLowerCase()}`;
    const newColors = setPersistentValue(storageKey, colors);
    set({ [keyMap[level]]: newColors });
  },

  setUiFontFamily: (font) => {
    const newFont = setPersistentValue('settings:ui-font-family', font, 'Poppins');
    set({ uiFontFamily: newFont });
  },

  setCarnetFontFamily: (font) => {
    const newFont = setPersistentValue('settings:carnet-font', font, 'Chau Philomene One');
    set({ carnetFontFamily: newFont });
  },
}));