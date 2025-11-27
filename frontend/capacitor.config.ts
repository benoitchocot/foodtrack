import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mealplans.app',
  appName: 'MealPlans',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://apifood.chocot.be']

    // Uncomment for development with local backend
    // url: 'http://YOUR_LOCAL_IP:3001',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
