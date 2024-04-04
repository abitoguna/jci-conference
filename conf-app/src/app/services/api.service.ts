import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public get<T>(url: string, pageSize = 50, pageNumber = 1, search?: string): Observable<T> {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize);
    params = params.append('pageNumber', pageNumber);
    if (search) {
      params = params.append('name', search);
    }
    return this.http.get<any>(`${environment.apiUrl}/${url}`, {
      headers: this.headers,
      params
    });
  }

  private get headers(): HttpHeaders {
    const headerConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    return new HttpHeaders(headerConfig);
  }
}
