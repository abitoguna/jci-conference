import { Routes } from '@angular/router';
import { ListComponent } from './components/delegates/list/list.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'southern-conf/delegates', component: ListComponent, canActivate: [AuthGuard] },
];
