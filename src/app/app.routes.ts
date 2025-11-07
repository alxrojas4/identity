import { Routes } from '@angular/router';
import { IdentityEntryComponent } from './features/identity-entry.component';

export const routes: Routes = [
  {
    path: 'biometria',
    component: IdentityEntryComponent,
  },
  {
    path: '',
    redirectTo: 'biometria',
    pathMatch: 'full',
  },
];
