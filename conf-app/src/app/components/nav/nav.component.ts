import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/service/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {

  name = localStorage.getItem('username') ?? '';

  constructor(private router: Router, private authService: AuthService) {}
  
  logOut(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
