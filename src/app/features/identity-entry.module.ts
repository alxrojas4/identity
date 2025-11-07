import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IdentityEntryComponent } from './identity-entry.component';

const routes: Routes = [
  {
    path: '',
    component: IdentityEntryComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./identity.routes').then((m) => m.IDENTITY_ROUTES),
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), IdentityEntryComponent],
})
export class IdentityEntryModule {}
