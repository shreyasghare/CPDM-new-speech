import { Component, OnInit, Inject } from '@angular/core';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ProjectsDetailService} from 'src/app/services/project/project-details.service';

@Component({
  selector: 'app-revenue-recognition-help',
  templateUrl: './revenue-recognition-help.component.html',
  styleUrls: ['./revenue-recognition-help.component.scss']
})
export class RevenueRecognitionHelpComponent implements OnInit {
  isData = false;
  policyOverview: any;
  mailers: any;
  generalHelp: any;

  public tabIndex = 0;
  public inline = false;
  public bordered = false;
  public tall = false;
  public vertical = false;
  public alignment: 'left' | 'right' | 'center';

  constructor(
    private projectsDetailService: ProjectsDetailService,
    public dialogRef: MatDialogRef<any>,
    private revRecService: RevenueRecognitionService,
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
    // this.revRecService.getDataByPath('help').subscribe(res=>{
    // this.revRecService.getHelpData().subscribe(res=>{
    //   this.isData = true;
    //   res.forEach(element => {
    //     if(element.title == "Policy Overview")
    //       this.policyOverviewData = element;
    //     // else if(element.title == "Commit Recommendation")
    //     //   this.commitRecData = element;
    //     else if(element.title == "Mailers")
    //       this.mailersData = element;
    //   });
    // },
    // err=>{
    // });

    this.projectsDetailService.getGeneralComplianceHelpOverlay('revenueRecognition').subscribe(res => {
      this.isData = true;
      res.forEach(element => {
        if (element.title === 'Policy Overview') {
          this.policyOverview = element;
        } else if (element.title === 'General Help') {
           this.generalHelp = element;
        } else if (element.title === 'Mailers') {
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
