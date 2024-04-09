import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Delegate } from '../../../interface/delegate.interface';
import { ApiService } from '../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(private apiService: ApiService) { }

  getAllDelegates(pageSize = 50, pageNumber = 1, filter: string): Observable<any> {
    return this.apiService.get<Delegate[]>('delegate/getAll', {pageSize, pageNumber, filter});
  }

  create(data: Partial<Delegate>): Observable<any> {
    return this.apiService.post('delegate/create', data);
  }

  update(data: Partial<Delegate>): Observable<any> {
    return this.apiService.put(`delegate/update/${data.id}`, data);
  }

  search(searchParam: string, pageSize = 50, pageNumber = 1, filter: string): Observable<any> {
    return this.apiService.get<Delegate[]>('delegate/search', {pageSize, pageNumber, searchParam, filter});
  }

  register(data: any): Observable<any> {
    return this.apiService.put('delegate/register', data);
  }
}