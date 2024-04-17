import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Config } from '../../interface/config.interface';
import { ListService } from '../delegates/service/list.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent implements OnInit, OnDestroy {
  config!: Config;
  isLoading = false;
  unsubscriber$ = new Subject<void>();
  formGroup = new FormGroup({
    mealType: new FormControl(''),
    banquetMode: new FormControl(false),
    isServingMeal: new FormControl(false)
  })
  constructor(
    private listService: ListService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ConfigComponent>
  ) {}

  ngOnInit(): void {
    this.getConfig();
  }

  getConfig(): void {
    this.isLoading = true;
    this.listService
      .getConfig()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.config = res.data;
        },
        error: (err) => {
          this.isLoading = false;
          this.openSnackBar(err.error.message);
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

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  update(): void {
    const data = this.formGroup.value;;
  }
}
