import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pricefdm.app',
  appName: 'PriceFDM',
  
  // Директория с билдом Vite
  webDir: 'dist',

  // Сервер для разработки (запуск с hot-reload)
  server: {
    // В продакшене: закомментировать строку ниже
    // url: 'http://192.168.X.X:5173',
    cleartext: true,
    androidScheme: 'https',
  },

  // Настройки для iOS
  ios: {
    contentInset: 'automatic',
    scheme: 'PriceFDM',
    backgroundColor: '#F1F5F9',
  },

  // Настройки для Android
  android: {
    backgroundColor: '#F1F5F9',
    allowMixedContent: true,
    captureInput: false,
    webContentsDebuggingEnabled: true,
  },

  // Статус-бар
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#F1F5F9',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
