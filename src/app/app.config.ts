import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { firebaseConfig } from './firebase.config';

function initializeFirebaseAuth() {
  const auth = getAuth();

  // Connect to emulator if on localhost
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('[AppConfig] Connecting Auth to Emulator at http://127.0.0.1:9099');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  }

  return auth;
}

function initializeFirebaseFirestore() {
  const firestore = getFirestore();

  // Connect to emulator if on localhost
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('[AppConfig] Connecting Firestore to Emulator at 127.0.0.1:8080');
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  }

  return firestore;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideClientHydration(withEventReplay()),

    // Firebase providers
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => initializeFirebaseAuth()),
    provideFirestore(() => initializeFirebaseFirestore())
  ]
};
