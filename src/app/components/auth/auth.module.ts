import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { CuiSpinnerModule } from '@cisco-ngx/cui-components';
import { AuthRoutingModule } from './auth-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        LoginComponent
    ],

    imports: [
        CommonModule,
        CuiSpinnerModule,
        AuthRoutingModule,
        FormsModule
    ]
})
export class AuthModule {}
