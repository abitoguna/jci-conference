import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from '../../loader/loader.component';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  isLoading = false;
  unsubscriber$ = new Subject<void>();
  formGroup = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    pin: new FormControl(null, [Validators.required]),
    team: new FormControl<string>('', [Validators.required]),
    isAdmin: new FormControl(false),
  });
  constructor(
    private dialogRef: MatDialogRef<SignupComponent>,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(takeUntil(this.unsubscriber$)).subscribe({
      next: (res) => {
        if (res.isAdmin) {
          this.formGroup.get('team')?.patchValue('admin');
        } else {
          this.formGroup.get('team')?.patchValue('');
        }
      },
    });
  }

  addUser(): void {
    if (this.formGroup.invalid) return;

    this.isLoading = true;
    const data = this.formGroup.value;

    this.authService
      .signUp(data)
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe({
        next: () => {
          this.openSnackBar('User added successfully.');
          this.dialogRef.close();
        },
        error: (err) => {
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

  isAdminSelected(): boolean {
    return Boolean(this.formGroup.get('isAdmin')?.value === true);
  }
}
