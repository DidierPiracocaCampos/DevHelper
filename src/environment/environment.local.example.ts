// Copia este archivo a environment.local.ts (gitignored). 'pnpm start' lo usa via fileReplacements (angular.json, config 'local').
// environment.local.ts NO se commitea (ver .gitignore); este ejemplo si, sin claves reales.
export const environment = {
  firebaseConfig: {
    projectId: 'devhelper-a61ef',
    appId: '1:35426644698:web:aad2c5afac9d3aa2276be3',
    storageBucket: 'devhelper-a61ef.firebasestorage.app',
    apiKey: 'AQUI_TU_API_KEY',
    authDomain: 'devhelper-a61ef.firebaseapp.com',
    messagingSenderId: '35426644698',
    measurementId: 'G-19T6CPNND6',
    projectNumber: '35426644698',
    version: '2',
  },
  nasaApiKey: 'AQUI_TU_NASA_API_KEY',
};
