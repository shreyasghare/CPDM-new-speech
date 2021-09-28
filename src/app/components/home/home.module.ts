import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from '../auth/login/login.component';
import { SharedComDirModule } from 'src/app/shared/shared-com-dir.module';
import { CommonModule } from '@angular/common';
import { CuiSearchModule, CuiTableModule, CuiPagerModule } from '@cisco-ngx/cui-components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [LandingPageComponent],
    imports: [
       CommonModule,
       FormsModule,
       RouterModule,
       HomeRoutingModule,
       SharedComDirModule,
       CuiSearchModule,
       CuiTableModule,
       CuiPagerModule,
       MatFormFieldModule,
       MatInputModule,
       MatSelectModule
    ]
})

export class HomeModule {}
