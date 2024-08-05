import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Delegate } from '../../../interface/delegate.interface';
import { LoaderComponent } from '../../loader/loader.component';
import { ListService } from '../service/list.service';

@Component({
  selector: 'app-add-edit-delegate',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent,
  ],
  templateUrl: './add-edit-delegate.component.html',
  styleUrl: './add-edit-delegate.component.scss',
})
export class AddEditDelegateComponent {
  isLoading = false;
  unsubscriber$ = new Subject<void>();
  formGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required]),
    localOrganisation: new FormControl('', [Validators.required]),
    membershipType: new FormControl(''),
    isRegistered: new FormControl(false),
    kitCollected: new FormControl(false),
    isLateRegistration: new FormControl(false),
  });

  isEditMode = false;
  title = '';
  delegate: Delegate | null = null;
  constructor(
    private dialogRef: MatDialogRef<AddEditDelegateComponent>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private service: ListService
  ) {
    this.title = this.data.title;
    this.delegate = this.data.delegate ?? null;
    if (this.delegate !== null) {
      this.isEditMode = true;
      this.initEditForm(this.delegate);
    }
  }

  initEditForm(delegate: Delegate): void {
    delegate.gender = delegate.gender.toLocaleLowerCase();
    this.formGroup.patchValue(delegate);
  }

  submit(): void {
    if (this.formGroup.invalid) return;

    this.isLoading = true;
    const data = this.formGroup.value as Delegate;
    if (this.isEditMode) {
      data['id'] = this.delegate?.id
    }
    this.service$(data).pipe(takeUntil(this.unsubscriber$)).subscribe({
      next: (() => {
        const message = `${data.firstName} ${data.lastName} has been ${this.isEditMode ? 'updated': 'created'} successfully.`
        this.openSnackBar(message);
        this.dialogRef.close({refresh: true});
      }),
      error: (err => {
        this.isLoading = false;
        this.openSnackBar(err.error.message);
      })
    })
  }

  service$(data: any): Observable<any> {
    if (this.isEditMode) return this.service.update(data);
    return this.service.create(data)
  }

  openSnackBar(message: string, action = '') {
    this._snackBar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 4000,
    });
  }


  closeModal(): void {
    this.dialogRef.close();
  }
}
