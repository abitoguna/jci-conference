import { Routes } from '@angular/router';
import { ListComponent } from './components/delegates/list/list.component';
import { NametagComponent } from './components/nametag/nametag.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'scantag/:id', component: NametagComponent },
  { path: 'collegiate-conf/delegates', component: ListComponent, canActivate: [AuthGuard] }
];
