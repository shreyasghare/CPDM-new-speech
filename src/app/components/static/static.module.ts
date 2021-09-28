import { NgModule } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common';  


@NgModule({
    imports: [CommonModule],
    declarations: [
        NavbarComponent,
        FooterComponent
    ],

    exports: [
        NavbarComponent,
        FooterComponent
    ]
})

export class StaticModule {}
