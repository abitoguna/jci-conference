import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Delegate } from '../../../interface/delegate.interface';
import { ApiService } from '../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(private apiService: ApiService) { }

  getAllDelegates(pageSize = 50, pageNumber = 1): Observable<any> {
    return this.apiService.get<Delegate[]>('delegate/getAll', pageSize, pageNumber);
  }

  search(searchParam: string, pageSize = 50, pageNumber = 1): Observable<any> {
    return this.apiService.get<Delegate[]>('delegate/search', pageSize, pageNumber, searchParam);
  }
}
