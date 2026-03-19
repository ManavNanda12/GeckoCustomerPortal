import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideSpinnerConfig } from 'ngx-spinner';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SOCIAL_AUTH_CONFIG
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideSpinnerConfig({ type: 'ball-scale-multiple'}),
    provideToastr({ positionClass: 'toast-top-right' }),
    provideAnimationsAsync(),
    provideHttpClient(),
      SocialAuthService,

    // ✅ IMPORTANT: Use the token (NOT string)
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
        onError: (err:any) => console.error(err)
      }
    }
  ]
};
