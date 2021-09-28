import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApiProductsComponent } from './api-products.component';
import { ApiProductsPlanComponent } from './api-products-plan/api-products-plan.component';
import { ApiProductsImplementComponent } from './api-products-implement/api-products-implement.component';
import { ApiProductsCompleteComponent } from './api-products-complete/api-products-complete.component';

const apiProductsRoutes: Routes = [
  {
    path: ':id',
    component: ApiProductsComponent,
    children: [
      { path: 'plan', component: ApiProductsPlanComponent },
      { path: 'implement', component: ApiProductsImplementComponent },
      { path: 'complete', component: ApiProductsCompleteComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(apiProductsRoutes)]
})
export class ApiProductsRoutesModule { }
 