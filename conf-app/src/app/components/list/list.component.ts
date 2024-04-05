import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, Observable, Subject, take, takeUntil } from 'rxjs';
import { ListService } from './service/list.service';
import { Delegate } from '../../interface/delegate.interface';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionCheckmarkDoneSharp,
  ionEyeSharp,
  ionPersonAddOutline,
} from '@ng-icons/ionicons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import { ProcessingComponent } from '../dialog/processing/processing.component';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    RouterLink,
    MatPaginatorModule,
    CommonModule,
    TitleCasePipe,
    LoaderComponent,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    NgIconComponent,
    MatDialogModule,
    ConfirmationComponent,
    ProcessingComponent,
    NavComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [
    provideIcons({ ionCheckmarkDoneSharp, ionEyeSharp, ionPersonAddOutline }),
  ],
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
  currentTab: 'unregistered' | 'registered' | 'all' = 'unregistered'
  constructor(
    private delegateService: ListService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getDelegates(this.pageNumber, this.pageSize, null, this.currentTab);
    this.search$
      .pipe(takeUntil(this.unsubscriber$), debounceTime(700))
      .subscribe({
        next: (value: string | null) => {
          this.pageNumber = 1;
          this.getDelegates(this.pageNumber, this.pageSize, value, this.currentTab);
        },
      });
  }

  getDelegates(
    pageNumber: number,
    pageSize: number,
    search: string | null,
    tab: 'unregistered' | 'registered' | 'all'
  ): void {
    this.isLoading = true;
    this.delegateListService$(pageNumber, pageSize, search, tab)
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

  delegateListService$(
    pageNumber: number,
    pageSize: number,
    searchParam: string | null,
    tab: 'unregistered' | 'registered' | 'all'
  ): Observable<any> {
    if (searchParam && searchParam?.length >= 3) {
      this.isSearching = true;
      return this.delegateService.search(searchParam, pageSize, pageNumber, tab);
    }
    this.isSearching = false;
    return this.delegateService.getAllDelegates(pageSize, pageNumber, tab);
  }

  attemptRegisteration(delegate: Delegate): void {
    const name = `${delegate.firstName} ${delegate.lastName}`;

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      disableClose: true,
      minHeight: '300px',
      minWidth: '600px',
      panelClass: ['ui-dialog'],
      data: {
        title: 'Are you sure ?',
        subTitle: `This will register ${name} for this conference.`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res.isConfirmed) {
            this.registerDelegate(delegate, name);
          }
        },
      });
  }

  openSnackBar(message: string, action = '') {
    this._snackBar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 4000,
    });
  }

  registerDelegate(delegate: Delegate, name: string): void {
    const dialogRef = this.dialog.open(ProcessingComponent, {
      disableClose: true,
      minHeight: '200px',
      minWidth: '600px',
      panelClass: ['ui-dialog'],
      data: {
        subTitle: `Confirming ${name}'s registration...`,
      },
    });

    this.delegateService
      .register(delegate.email)
      .pipe(take(1))
      .subscribe({
        next: () => {
          const successMessage = `${name} has been registered successfully.`;
          this.openSnackBar(successMessage, '🥳');
          dialogRef.close();
        },
        error: (err: any) => {
          this.openSnackBar(err.error.message);
          dialogRef.close();
        },
      });
  }

  setTab(tab: 'unregistered' | 'registered' | 'all'): void {
    if (this.currentTab === tab) return;
    this.currentTab = tab;
    this.pageNumber = 1;
    this.totalCount = 0;

    this.getDelegates(this.pageNumber, this.pageSize, this.searchFormControl, this.currentTab);
  }
}
