import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation, withRouterConfig } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';

import { routes } from './app.routes';
import { JwtInterceptor } from './interceptors/jwt.interceptors';

export function tokenGetter () {
  return JSON.parse(localStorage.getItem('token') ?? '');
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideRouter(routes, withHashLocation(), withRouterConfig({ paramsInheritanceStrategy: 'always'})),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    importProvidersFrom(
      JwtModule.forRoot({
          config: {
              tokenGetter: tokenGetter,
              allowedDomains: [],
              skipWhenExpired: true
          },
      }),
  )
  ],
};
