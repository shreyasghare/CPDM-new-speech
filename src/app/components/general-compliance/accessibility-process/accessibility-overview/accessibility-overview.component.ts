import { Component, OnInit } from '@angular/core';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import {ProjectsDetailService} from 'src/app/services/project/project-details.service';
import { ActivatedRoute } from '@angular/router';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-accessibility-overview',
  templateUrl: './accessibility-overview.component.html',
  styleUrls: ['./accessibility-overview.component.scss']
})
export class AccessibilityOverviewComponent implements OnInit {
  [x: string]: any;
  overviewStatus: boolean;
  isUserPm: boolean;
  projectId = this.activatedRoute.snapshot.params.id;
  showLoader: boolean;
  constructor(
    public cuiModalService: CuiModalService,
    private userService: UserDetailsService,
    private accessibilityService: AccessibilityProcessService,
    private activatedRoute: ActivatedRoute,
    private projectsDetailService: ProjectsDetailService,
    public dialogRef: MatDialogRef<any>
  ) { }

  public tabIndex = 0;
  public inline = false;
  public bordered = false;
  public tall = false;
  public vertical = false;
  public alignment: 'left' | 'right' | 'center';
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

  commitRecommendation: any;
  policyOverview: any;
  trainingMailer: any;
  generalHelp: any;
  isData = false;

  ngOnInit() {
    // this.isUserPm = this.userService.getUserRole.toLowerCase() == 'pm';
    // let overview = '';
    // if (this.isUserPm)
    //   overview = 'skipOverviewPM'
    // else
    //   overview = 'skipOverviewPO'
    // this.accessibilityService.getOverviewSelection(this.projectId, overview).subscribe(res => {
    //   if (res && this.isUserPm)
    //     this.overviewStatus = res.skipOverviewPM
    //   else
    //     this.overviewStatus = res.skipOverviewPO
    // })

    // this.accessibilityService.getAccessibilityOverlayContent().subscribe(res=>
    //   res.forEach(element => {
    //     if (element.title == 'General Help') {
    //       this.generalHelp = element
    //     }
    //     else if (element.title == 'Commit Recommendation') {
    //       this.commitRecommendation = element
    //     }
    //     else if (element.title == 'Policy Overview') {
    //       this.policyOverview = element
    //     }
    //     else if (element.title == 'Training/Mailer') {
    //       this.trainingMailer = element
    //     }
    //   })
    // )

    this.projectsDetailService.getGeneralComplianceHelpOverlay('accessibility').subscribe(res => {
      if (res) {
        this.isData = true;
        res.forEach(element => {
          if (element.title === 'General Help') {
            this.generalHelp = element;
          } else if (element.title === 'Commit Recommendation') {
            this.commitRecommendation = element;
          } else if (element.title === 'Policy Overview') {
            this.policyOverview = element;
          } else if (element.title === 'Training/Mailer') {
            this.trainingMailer = element;
          }
        });
      }
    }
    );

  }

  onOverviewStatusChecked() {
    this.showLoader = true;
    let overview = {};
    if (this.isUserPm) {
      overview = { skipOverviewPM: this.overviewStatus };
    } else if (!this.isUserPm) {
      overview = { skipOverviewPO: this.overviewStatus };
    }
    this.accessibilityService.putSkipOverview(this.projectId, overview).subscribe(accessiblityOverview => {
      this.showLoader = false;
    }, err => {
      this.showLoader = false;
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
