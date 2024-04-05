import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.handleAcess(req, next));
  }

  setAuthToken(request: HttpRequest<any>) {
    const token = localStorage.getItem('token');
    if (token) {
      return request.clone({
        setHeaders: {
          Authorizzzation: `Bearer ${token}`,
        },
      });
    } else {
      return request;
    }
  }

  private async handleAcess(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    if (!request.url.includes('/login')) {
      request = this.setAuthToken(request);
    }
    return await lastValueFrom(next.handle(request));
  }
}
