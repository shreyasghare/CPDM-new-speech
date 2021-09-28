import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-accessibility-info-helper',
  templateUrl: './accessibility-info-helper.component.html',
  styleUrls: ['./accessibility-info-helper.component.scss']
})
export class AccessibilityInfoHelperComponent implements OnInit {
  helperObj = null;
  infoData = null;
  infoHelperData: any;

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any,
              private projectDataService: ProjectsDataService) { }

  ngOnInit() {
    this.infoData = this.data.infoData;

    let headerName;
    if (this.infoData.name.includes('Identify ADRs') || this.infoData.name.includes('ADR List Approval')) {
      headerName = 'Identify ADRs & ADR List Approval';
    } else {
      headerName = this.infoData.name;
    }
    this.projectDataService.getItemDesc(headerName).subscribe(res => {
      this.infoHelperData = res[0];
      if (this.infoHelperData.name.includes(this.infoData.name)) {
        this.helperObj = {
            header: this.infoData.name,
        };
        if (this.infoHelperData.paragraph1) {
          if (this.infoHelperData.paragraph1.header) {
              this.helperObj.subheader1 = this.infoHelperData.paragraph1.header;
          }
        }
        if (this.infoHelperData.paragraph1) {
          if (this.infoHelperData.paragraph1.content) {
              this.helperObj.subcontent1 = this.infoHelperData.paragraph1.content;
          }
        }
        if (this.infoHelperData.paragraph2) {
          if (this.infoHelperData.paragraph2.header) {
          this.helperObj.subheader2 = this.infoHelperData.paragraph2.header;
          }
        }
        if (this.infoHelperData.paragraph2) {
          if (this.infoHelperData.paragraph2.content) {
          this.helperObj.subcontent2 = this.infoHelperData.paragraph2.content;
          }
        }
        if (this.infoHelperData.paragraph3) {
          if (this.infoHelperData.paragraph3.content) {
          this.helperObj.subcontent3 = this.infoHelperData.paragraph3.content;
          }
        }
        if (this.infoHelperData.paragraph4) {
          if (this.infoHelperData.paragraph4.content) {
          this.helperObj.subcontent4 = this.infoHelperData.paragraph4.content;
          }
        }
        if (this.infoHelperData.paragraph5) {
          if (this.infoHelperData.paragraph5.header) {
          this.helperObj.subheader5 = this.infoHelperData.paragraph5.header;
          }
        }
        if (this.infoHelperData.paragraph5) {
          if (this.infoHelperData.paragraph5.content) {
          this.helperObj.subcontent5 = this.infoHelperData.paragraph5.content;
          }
        }
        if (this.infoHelperData.paragraph6) {
          if (this.infoHelperData.paragraph6.content) {
          this.helperObj.subcontent6 = this.infoHelperData.paragraph6.content;
          }
        }
     }
      // this.cuiModalService.show(this.tooltipContent, obj.size); //commented to use angular material modal
    },
    err => {
      console.error(err);
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
