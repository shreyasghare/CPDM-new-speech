import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

export interface IhelperResponse {
  name: string;
  description: string ;
}
@Component({
  selector: 'app-info-helper',
  templateUrl: './info-helper.component.html',
  styleUrls: ['./info-helper.component.scss']
})
export class InfoHelperComponent implements OnInit {
  helperResponse: IhelperResponse;
  isData = false;
  isSingleDesc = false;
  slData: any;
  singleDescCompliance: Array<String> = ['revenueRecognition', 'apiProducts'];
  constructor(private dataService: ProjectsDataService, public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    const stepName = this.data.stepName;
    this.isSingleDesc = this.data.complianceName && this.singleDescCompliance.includes(this.data.complianceName) ? true : false;
    this.dataService.getItemDesc(stepName).subscribe(res => {
      this.isData = true;

      this.helperResponse = res[0];
      if (this.helperResponse) {
        if (this.helperResponse.name && this.helperResponse.name.toLowerCase().startsWith('apiproducts_')) {
          this.helperResponse.name = this.helperResponse.name.replace('ApiProducts_', '');
        } else if (this.helperResponse.name && this.helperResponse.name.toLowerCase().startsWith('telemetry_')) {
          this.helperResponse.name = this.helperResponse.name.replace('Telemetry_', '');
        } else if (this.helperResponse.name && this.helperResponse.name.toLowerCase().startsWith('ipv6')) {
          this.helperResponse.name = this.helperResponse.name.replace('IPv6_', '');
        } else if (this.data.header && this.data.header.toLowerCase().startsWith('revrec ')) {
          this.helperResponse.name = this.data.header.replace('revRec ', '');
        } else if (this.data.header) {
          this.helperResponse.name = this.data.header;
        }
      }
    },
    err => {
    });
  }

  ngAfterViewInit() {}

  onClose(): void {
    this.dialogRef.close(false);
  }

}
