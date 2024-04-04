import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { ListService } from './service/list.service';
import { Delegate } from '../../interface/delegate.interface';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    RouterLink,
    MatPaginatorModule,
    CommonModule,
    TitleCasePipe,
    LoaderComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, OnDestroy {
  allDelegates: Delegate[] = [];
  unsubscriber$ = new Subject<void>();
  isLoading = false;
  totalCount = 0;
  pageSize = 25;
  pageNumber = 1;
  searchFormControl: string | null = null;
  search$ = new Subject<string | null>();
  isSearching = false;
  constructor(private delegateService: ListService) {}

  ngOnInit(): void {
    this.getDelegates(this.pageNumber, this.pageSize, null);
    this.search$.pipe(takeUntil(this.unsubscriber$), debounceTime(700)).subscribe({
      next: (value: string | null) => {
        this.pageNumber = 1;
        this.getDelegates(this.pageNumber, this.pageSize, value);
      }
    })
  }

  getDelegates(pageNumber: number, pageSize: number, search: string | null): void {
    this.isLoading = true;
    this.delegateListService$(pageNumber, pageSize, search)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe({
        next: (res) => {
          this.allDelegates = [...res.data];
          this.totalCount = res.totalCount;
          this.pageNumber = res.page;
          this.pageSize = res.pageSize;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  searchDelegates(): void {
    this.search$.next(this.searchFormControl);
  }

  delegateListService$(pageNumber: number, pageSize: number, searchParam: string | null): Observable<any> {
    if (searchParam && searchParam?.length >= 3) {
      this.isSearching = true;
      return this.delegateService.search(searchParam, pageSize, pageNumber);
    }
    this.isSearching = false;
    return this.delegateService.getAllDelegates(pageSize, pageNumber);
  }
}
