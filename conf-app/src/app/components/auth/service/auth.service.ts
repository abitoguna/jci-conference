import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private jwtHelperService: JwtHelperService
  ) {}

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const tokenExpired: boolean = this.jwtHelperService.isTokenExpired(token);
    return !tokenExpired;
  }

  login(data: any): Observable<any> {
    return this.apiService.post('user/login', data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        const user = this.jwtHelperService.decodeToken(res.token);
        localStorage.setItem('userId', user.userId);
        localStorage.setItem('username', user.username);
        localStorage.setItem('team', user.team);
      })
    );
  }

  signUp(data: any): Observable<any> {
    return this.apiService.post('user/signup', data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('team');
  }
}
