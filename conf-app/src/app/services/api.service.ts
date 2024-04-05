import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public get<T>(url: string, queryParam: any): Observable<T> {
    let params = new HttpParams();
    Object.keys(queryParam).forEach((key: string) => {
      if (key !== 'searchParam') {
        params = params.append(key, queryParam[key]);
      } else {
        params = params.append('name', queryParam[key]);
      }
    })
    return this.http.get<any>(`${environment.apiUrl}/${url}`, {
      headers: this.headers,
      params
    });
  }

  public put(url: string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/${url}`, data, {
      headers: this.headers
    });
  }

  public post(url: string, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/${url}`, data, {
      headers: this.headers
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
