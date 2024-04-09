import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/service/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SigninComponent } from '../auth/signin/signin.component';
import { take } from 'rxjs';
import { SignupComponent } from '../auth/signup/signup.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule, MatDialogModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  isLoggedIn = this.authService.isLoggedIn();
  isAdmin = localStorage.getItem('team') === 'admin';
  constructor(private authService: AuthService, private dialog: MatDialog) {
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  sigin(): void {
    this.dialog
      .open(SigninComponent, {
        panelClass: ['ui-dialog'],
        minHeight: '300px',
        minWidth: '600px',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.isLoggedIn = this.authService.isLoggedIn();
      });
  }

  addUser(): void {
    this.dialog
      .open(SignupComponent, {
        panelClass: ['ui-dialog'],
        minHeight: '300px',
        minWidth: '600px',
      });
  }
}
