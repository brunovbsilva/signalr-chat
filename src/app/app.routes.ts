import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: '', component: LayoutComponent, 
    children: [
      { path: '', loadComponent: () => import('./home/home.component') },
      { path: 'chat', data: { name: String }, loadComponent: () => import('./chat/chat.component')}
    ]
  }
];
