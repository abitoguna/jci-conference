import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [MatDialogModule, LoaderComponent],
  templateUrl: './processing.component.html',
  styleUrl: './processing.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProcessingComponent {
  @Input() title = '';
  @Input() subTitle = '';

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.title = this.data.title ?? 'Processing...';
    this.subTitle = this.data.subTitle;
  }

}
