import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommunicationsRegulatoryComponent } from './communications-regulatory.component';
import { CrcCompleteComponent } from './crc-complete/crc-complete.component';
import { CrcIdentifyComponent } from './crc-identify/crc-identify.component';
import { CrcImplementComponent } from './crc-implement/crc-implement.component';
import { CrcSubmitComponent } from './crc-submit/crc-submit.component';

const communicationsRegulatoryChildRoutes: Routes = [{
    path: ':id',
    component: CommunicationsRegulatoryComponent,
    children: [
        { path: 'submit', component: CrcSubmitComponent },
        { path: 'identify', component: CrcIdentifyComponent },
        { path: 'implement', component: CrcImplementComponent },
        { path: 'complete', component: CrcCompleteComponent }
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(communicationsRegulatoryChildRoutes)]
})

export class CommunicationsRegulatoryRoutesModule { }