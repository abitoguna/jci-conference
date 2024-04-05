import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { LoaderComponent } from '../../loader/loader.component';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [MatDialogModule, FormsModule, ReactiveFormsModule, CommonModule, LoaderComponent],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnDestroy {
  usernameControl = new FormControl(null, [Validators.required]);
  passwordControl = new FormControl(null, [Validators.required]);

  formGroup = new FormGroup({
    username: this.usernameControl,
    password: this.passwordControl
  })
  isLoading = false;
  unsubscriber$ = new Subject<void>();
  constructor(private dialogRef: MatDialogRef<SigninComponent>, private authService: AuthService, 
    private _snackBar: MatSnackBar) {}

  login(): void {
    if (this.formGroup.invalid) return;

    this.isLoading = true;
    const data = this.formGroup.value;

    this.authService.login(data).pipe(takeUntil(this.unsubscriber$)).subscribe({
      next: (res) => {
        this.openSnackBar('Login successful!');
        this.dialogRef.close();
        this.isLoading = false
      },
      error: (err: any) => {
        const message = err.error.message;
        this.isLoading = false
        this.openSnackBar(message);
      }
    })
    
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
}
