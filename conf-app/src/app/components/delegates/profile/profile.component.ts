import { Component, Input } from '@angular/core';
import { Delegate } from '../../../interface/delegate.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @Input({required: true}) delegate!: Delegate;

}
