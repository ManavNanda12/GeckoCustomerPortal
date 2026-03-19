import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideSpinnerConfig } from 'ngx-spinner';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  GoogleLoginProvider,
  SocialAuthService,
  SOCIAL_AUTH_CONFIG
} from '@abacritt/angularx-social-login';

// Firebase
import { FirebaseApp, provideFirebaseApp } from '@angular/fire/app';
import { provideMessaging } from '@angular/fire/messaging';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideSpinnerConfig({ type: 'ball-scale-multiple' }),
    provideToastr({ positionClass: 'toast-top-right' }),
    provideAnimationsAsync(),
    provideHttpClient(),

    // ✅ Firebase init
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // ✅ Messaging (SYNC ONLY)
    provideMessaging(() => {
      const app = inject(FirebaseApp);
      return getMessaging(app);
    }),

    SocialAuthService,
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '293085846424-6gdau0cauj89r46k2tdpn38l51aqcnam.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err: any) => console.error(err)
      }
    }
  ]
};