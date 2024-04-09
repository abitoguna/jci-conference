import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime, Observable, Subject, take, takeUntil } from 'rxjs';
import { ListService } from '../service/list.service';
import { Delegate } from '../../../interface/delegate.interface';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { LoaderComponent } from '../../loader/loader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionCheckmarkDoneSharp,
  ionEyeSharp,
  ionPersonAddOutline,
  ionEllipsisVerticalCircleOutline,
  ionShirtSharp,
} from '@ng-icons/ionicons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../dialog/confirmation/confirmation.component';
import { ProcessingComponent } from '../../dialog/processing/processing.component';
import { NavComponent } from '../../nav/nav.component';
import { MatMenuModule } from '@angular/material/menu';
import { AddEditDelegateComponent } from '../add-edit-delegate/add-edit-delegate.component';

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
    NavComponent,
    MatMenuModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [
    provideIcons({
      ionCheckmarkDoneSharp,
      ionEyeSharp,
      ionPersonAddOutline,
      ionEllipsisVerticalCircleOutline,
      ionShirtSharp,
    }),
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
  currentTab: 'unregistered' | 'registered' | 'all' = 'unregistered';
  isAdmin = localStorage.getItem('team') === 'admin';
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
          this.getDelegates(
            this.pageNumber,
            this.pageSize,
            value,
            this.currentTab
          );
        },
      });
  }

  getDelegates(
    pageNumber: number,
    pageSize: number,
    search: string | null,
    tab: 'unregistered' | 'registered' | 'all',
    isBackground = false
  ): void {
    this.isLoading = !isBackground;
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
      return this.delegateService.search(
        searchParam,
        pageSize,
        pageNumber,
        tab
      );
    }
    this.isSearching = false;
    return this.delegateService.getAllDelegates(pageSize, pageNumber, tab);
  }

  registerOnly(delegate: Delegate): void {
    const name = `${delegate.firstName} ${delegate.lastName}`;
    let message = '';
    if (!delegate.isRegistered) {
      message = `This will register ${name} only and will not confirm ${
        delegate.gender === 'male' ? 'his' : 'her'
      } kit collection.`;
    } else if (delegate.isRegistered && delegate.kitCollected) {
      message = `This will register cancel kit collection for ${name}.`;
    }
    const data = {
      isKitCollected: false,
      email: delegate.email,
    };
    this.openConfirmation(message, data, name);
  }

  confirmKitOnly(delegate: Delegate): void {
    const name = `${delegate.firstName} ${delegate.lastName}`;
    const message = `This will confirm ${name} has collected ${
      delegate.gender === 'male' ? 'his' : 'her'
    } kit.`;
    const data = {
      isKitCollected: true,
      email: delegate.email,
    };
    this.openConfirmation(message, data, name);
  }

  fullRegistration(delegate: Delegate): void {
    if (delegate.isRegistered) {
      this.openSnackBar('Delegate has been previously registered.');
      return;
    }
    const name = `${delegate.firstName} ${delegate.lastName}`;
    const message = `This will register ${name} and confirm ${
      delegate.gender === 'male' ? 'his' : 'her'
    } kit collection.`;
    const data = {
      isKitCollected: true,
      email: delegate.email,
    };
    this.openConfirmation(message, data, name);
  }

  cancelRegistration(delegate: Delegate): void {
    const name = `${delegate.firstName} ${delegate.lastName}`;
    const message = `This will cancel registeration and kit collection for ${name}.`;
    const data = {
      cancelRegistration: true,
      email: delegate.email,
    };
    this.openConfirmation(message, data, name);
  }

  openConfirmation(message: string, data: any, name: string): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      disableClose: true,
      minHeight: '300px',
      minWidth: '600px',
      panelClass: ['ui-dialog'],
      data: {
        title: 'Are you sure ?',
        subTitle: message,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res.isConfirmed) {
            this.registerDelegate(data, name);
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

  registerDelegate(data: any, name: string): void {
    const dialogRef = this.dialog.open(ProcessingComponent, {
      disableClose: true,
      minHeight: '200px',
      minWidth: '600px',
      panelClass: ['ui-dialog'],
      data: {
        subTitle: 'Processing your request...',
      },
    });

    this.delegateService
      .register(data)
      .pipe(take(1))
      .subscribe({
        next: () => {
          // const successMessage = `${name} has been registered successfully.`;
          this.openSnackBar('Action completed', '🥳');
          this.getDelegates(
            this.pageNumber,
            this.pageSize,
            this.searchFormControl,
            this.currentTab,
            true
          );
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

    this.getDelegates(
      this.pageNumber,
      this.pageSize,
      this.searchFormControl,
      this.currentTab
    );
  }

  openDelegateForm(delegate?: Delegate): void {
    const isEditMode = !!delegate;
    const dialogRef = this.dialog.open(AddEditDelegateComponent, {
      data: {
        delegate,
        title: isEditMode ? `Edit ${delegate?.firstName} ${delegate.lastName}` : 'Register a new delegate'
      },
      height: '100%',
      width: '500px',
      panelClass: ['ui-dialog'],
      position: {top: '0px', right: '0px'},
      autoFocus: false
    })

    dialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res.refresh) {
        this.getDelegates(
        this.pageNumber,
        this.pageSize,
        this.searchFormControl,
        this.currentTab,
        true
      );
      }
    })
  }
}
