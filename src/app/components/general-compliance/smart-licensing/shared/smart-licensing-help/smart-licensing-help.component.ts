import { Component, OnInit, Inject } from '@angular/core';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-smart-licensing-help',
  templateUrl: './smart-licensing-help.component.html',
  styleUrls: ['./smart-licensing-help.component.scss']
})
export class SmartLicensingHelpComponent implements OnInit {
  isData = false;
  policyOverview: any;
  mailers: any;
  commitRecommendation: any;

  public tabIndex = 0;
  public inline = false;
  public bordered = false;
  public tall = false;
  public vertical = false;
  public alignment: 'left' | 'right' | 'center';


  constructor(private projectsDetailService: ProjectsDetailService,
              public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  public alignmentOptions = [
    {
      name: 'Left',
      value: 'left',
    },
    {
      name: 'Right',
      value: 'right',
    },
    {
      name: 'Center',
      value: 'center',
    },
  ];

  ngOnInit() {
    this.projectsDetailService.getGeneralComplianceHelpOverlay('smartLicensing').subscribe(res => {
      this.isData = true;
      res.forEach(element => {
        if (element.title == 'Policy Overview') {
          this.policyOverview = element;
        } else if (element.title == 'Commit Recommendation') {
           this.commitRecommendation = element;
 } else if (element.title == 'Mailer') {
          this.mailers = element;
 }
      });
    },
    err => {
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
