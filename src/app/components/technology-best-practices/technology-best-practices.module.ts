import { NgModule } from '@angular/core';
import { SharedComDirModule } from '@cpdm-shared/shared-com-dir.module';
import { MatTableModule, MatCheckboxModule, MatPaginatorModule } from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CuiTabsModule } from '@cisco-ngx/cui-components';
import { Ipv6CompleteComponent } from './ipv6/ipv6-complete/ipv6-complete.component';

const importsArray = [
  SharedComDirModule,
  MatTableModule,
  MatCheckboxModule,
  MatPaginatorModule,
  ScrollingModule,
  CuiTabsModule
];

@NgModule({
  declarations: [Ipv6CompleteComponent],
  imports: importsArray,
  exports: importsArray
})
export class TechnologyBestPracticesModule { }
