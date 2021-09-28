import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CreateCommitComponent } from './create-commit/create-commit.component';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProjectDetailsTable } from '@cpdm-model/ProjectDetailsTable';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { MatTabChangeEvent } from '@angular/material';
import { MatomoTracker } from 'ngx-matomo';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})

export class ProjectDetailsComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private projectDataService: ProjectsDataService,
              private modalService: BsModalService,
              private revRecService: RevenueRecognitionService,
              private projectDetailsService: ProjectsDetailService,
              private utilsService: UtilsService,
              private router: Router,
              private matomoTracker: MatomoTracker,
              private userDetailsService:UserDetailsService) {}
  bsModalRef: BsModalRef;
  projectObj: any;
  projectId: string;
  apiResposnseReady: boolean;
  projectName: string;
  technicalStandardItems: any[];
  complianceItems: any[];
  additionalRequirements: any[];
  apiError: boolean;
  projectUID:string;

  complianceItemsSortedData: ProjectDetailsTable[];
  TechnologyItemsSortedData: ProjectDetailsTable[];
  projectDetailsSubscription: Subscription;
  pptDataSubscription: Subscription;

  loggedInUser = this.userDetailsService.currentUserValue;
  thinOnlineUrl: any;

  // to disable download while untill it gets data from api
  isPptCommitEnable = true;
  revRecComplianceId: any;
  setComplianceRefID: any;
  projectTemplate: any;
  selectedTabIndex = 0;
  onPageChanged(pageInfo: any): void {
  }

  // Fetching the table data using project id
  fetchTableData(proId: string): void {
    this.projectDetailsSubscription =  this.projectDataService.getProjectDetails(proId).subscribe(res => {
      this.projectDetailsService.setProjectDetails(res);
      this.projectObj = res;
      this.projectId = res._id;
      this.projectUID =  res.uid;

      if (res.streamId) {
      this.thinOnlineUrl = `${environment.thinOnlineUrl}${res.streamId}`;
      } else {
      this.thinOnlineUrl = `${environment.thinOnlineUrl}`;
      }

      this.complianceItems = res.complianceItems;
      if (this.complianceItems.length > 0) {
      this.complianceItems.forEach(element => { element.complianceType = 'general'; });
      }

      this.additionalRequirements = res.additionalRequirements;
      if (this.additionalRequirements.length > 0) {
      this.additionalRequirements.forEach(element => { element.complianceType = 'additional'; });
      }

      this.technicalStandardItems = res.technicalStandardItems;
      if (this.technicalStandardItems.length > 0) {
      this.technicalStandardItems.forEach(element => { element.complianceType = 'technicalStandard'; });
      }

      this.revRecService.setProjectId(res._id);
      for (const iterator of this.complianceItems) {
      if (iterator.name === 'Revenue Recognition') {
        this.revRecComplianceId = iterator._id;
        this.setComplianceRefID = iterator.complianceRefID;
        this.revRecService.setRevRecComplianceId(this.revRecComplianceId);
        this.revRecService.setComplianceRefID(this.setComplianceRefID);
        break;
      }
    }
      this.projectName = res.name;
      if (this.selectedTabIndex === 1) {
        this.complianceItemsSortedData = this.combineCompilanceItems(this.additionalRequirements, []) ;
      }
      else if (this.selectedTabIndex === 2) {
        this.complianceItemsSortedData = this.combineCompilanceItems(this.technicalStandardItems, []) ;
      }
     else if (this.selectedTabIndex === 0) {
      // this.complianceItemsSortedData = this.combineComplianceItems(res.complianceItems, res.additionalRequirements);
      // this.complianceItemsSortedData = this.complianceItems.concat(this.additionalRequirements);
      // this.complianceItemsSortedData = this.combineCompilanceItems(this.complianceItems, this.additionalRequirements) ;
      this.complianceItemsSortedData = this.combineCompilanceItems(this.complianceItems, []) ;
    }
      this.apiResposnseReady = true;
      this.projectTemplate = res.templates[0] == null ? null : res.templates[0].name ;
   }, (err) => {
     this.apiResposnseReady = true;
     this.apiError = true;
   });
  }

  ngOnInit() {
    this.fetchTableData(this.route.snapshot.params.id);
    if (this.projectDetailsService.selectedTabValue) {
      this.selectedTabIndex = this.projectDetailsService.selectedTabValue.tabIndex;
    }
  }

  async downloadPptxFromApi() {
    if (this.projectId != null) {
      this.isPptCommitEnable = false;
      try {
        this.utilsService.downloadFileFromNode(`ppt/generate/${this.projectId}`, `${this.projectName}.pptx`);
      } catch (error) {
        console.error(error);
      }
      this.isPptCommitEnable = true;
    }
    this.matomoTracker.trackEvent('ProjectDetailsPage','PPTCommit',`projectName = ${this.projectName}`);
  }

  goToThinOnline() {    
    window.open(this.thinOnlineUrl, '_blank');
    this.matomoTracker.trackEvent('ProjectDetailsPage','OnlineCommit',`projectName = ${this.projectName}`);
  }

  openCreateCommitPopUp(projectId) {
    const initialState = {
      projectObj: this.projectObj,
    };
    this.bsModalRef = this.modalService.show(CreateCommitComponent, {class: 'bsModalStyle', initialState});
    this.bsModalRef.content.closeBtnName = 'Close';
  }
  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    this.projectDetailsSubscription.unsubscribe();
    if (this.pptDataSubscription) {
      this.pptDataSubscription.unsubscribe();
    }
    // *****************************************************/
  }

  combineComplianceItems(complianceItems, additionalRequirements) {
    // if(complianceItems){
    //   complianceItems.forEach(element => {
    //     element['complianceType'] = 'general'
    //   });
    // }
    // if(additionalRequirements){
      // additionalRequirements.forEach(element => {
      //   element['complianceType'] = 'additional'
      // });
      // return complianceItems.concat(additionalRequirements);
    // }
    return complianceItems.concat(additionalRequirements);
    // return complianceItems;
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.complianceItemsSortedData = [];
    this.selectedTabIndex = tabChangeEvent.index;
    this.projectDetailsService.selectedComplianceTabIndex({selectedTabIndex:  tabChangeEvent.index});
    // this.arrangeTableData(this.projectDetailsService.getProjectDetails);
    this.fetchTableData(this.route.snapshot.params.id);
  }

  combineCompilanceItems(complianceItems, additionalRequirements) {
    let applicableItems = [];
    let notApplicableItems = [];
    if (complianceItems) {
      complianceItems.forEach(element => {
        if (this.selectedTabIndex === 0) {
          element.complianceType = 'general';
        }
        else if (this.selectedTabIndex === 1) {
          element.complianceType = 'additional';
        }
        else if (this.selectedTabIndex === 2) {
          element.complianceType = 'technicalStandard';
        }
        // this.selectedTabIndex === 0 ? element.complianceType = 'general' : element.complianceType = 'technicalStandard';
      });
    }
    if (additionalRequirements) {
      additionalRequirements.forEach(element => {
        element.complianceType = 'additional';
      });
    }

    applicableItems = complianceItems.filter(element => element.selected);
    applicableItems = [...applicableItems, ...additionalRequirements.filter(element => element.selected)];
    this.sortList(applicableItems, 'name');

    notApplicableItems = complianceItems.filter(element => !element.selected);
    notApplicableItems = [...notApplicableItems, ...additionalRequirements.filter(element => !element.selected)];

    this.sortList(notApplicableItems, 'name');
    return [...applicableItems, ...notApplicableItems];
  }

  sortList(list, property) {
    list.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
  }


}
