import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ConfirmationComponent {
  @Input() title = '';
  @Input() subTitle = '';
  @Input() confirmButtonText = 'Yes';
  @Input() cancelButtonText = 'No';

  constructor(private dialogRef: MatDialogRef<ConfirmationComponent>, @Inject(MAT_DIALOG_DATA) private data: any) {
    this.title = this.data.title;
    this.subTitle = this.data.subTitle;
    this.confirmButtonText = this.data.confirmButtonText ?? 'Yes';
    this.cancelButtonText = this.data.cancelButtonText ?? 'No'
  }

  confirm(isConfirmed: boolean): void {
    this.dialogRef.close({isConfirmed: isConfirmed});
  }

}
