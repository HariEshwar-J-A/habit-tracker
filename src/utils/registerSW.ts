import { registerSW as register } from 'virtual:pwa-register';

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = register({
      onRegistered(r) {
        console.log('Service worker registered');
      },
      onRegisterError(error) {
        console.error('Service worker registration failed:', error);
      },
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW();
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }
};