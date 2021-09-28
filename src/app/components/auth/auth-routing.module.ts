import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

const authRoutes: Routes = [
    { path: '', component: LoginComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(authRoutes)
    ]
})

export class AuthRoutingModule {}
