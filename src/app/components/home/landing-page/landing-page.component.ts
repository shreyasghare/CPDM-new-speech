import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { CuiTableOptions } from '@cisco-ngx/cui-components';
import { get } from '@cisco-ngx/cui-utils/nodash';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { Role } from '@cpdm-model/role';
import { MatomoTracker } from 'ngx-matomo';
import { VoiceRecognitionService } from '@cpdm-service/voice-recognition.service';
import { TextToSpeechService } from '@cpdm-service/text-to-speech.service';

const _ = { get };

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  getAllProjectSubscription: Subscription;
  math = Math;
  selected: {};
  allowSearchFilters = [Role.accessibilityPO, Role.revRecPO, Role.smartLicensingPO, Role.BUController, Role.engSox, Role.csdlPO, Role.exportCompliancePO, Role.communicationsRegulatoryPO, Role.globalizationPO];


  constructor(private projectService: ProjectsDataService,
              private router: Router,
              private userDetailsSerivce: UserDetailsService,
              private vocieRecService : VoiceRecognitionService,
              private ngZone: NgZone,
              private textToSpeechService : TextToSpeechService,
              private projectDetails: ProjectsDetailService,
              private loaderService: LoaderService,
              private matomoTracker: MatomoTracker) {}


  @ViewChild('assignedOn', { static: true }) assignedOnTemplate: TemplateRef<any>;
  @ViewChild('action', { static: true }) actionTemplate: TemplateRef<any>;
  @ViewChild('projectStatus', { static: true }) projectStatusTemplate: TemplateRef<any>;
  @ViewChild('projectCompliance', { static: true }) projectCompliance: TemplateRef<any>;
  @ViewChild('projectOwner', { static: true }) projectOwnerTemplate: TemplateRef<any>;
  @ViewChild('assignMembers', { static: true }) assignMembersTemplate: TemplateRef<any>;
  @ViewChild('rrBusinessUnit', { static: true }) rrBusinessUnitTemplate: TemplateRef<any>;

  @ViewChild('projectNamePM', { static: true }) projectNamePMTemplate: TemplateRef<any>
  @ViewChild('projectName', { static: true }) projectNameTemplate: TemplateRef<any>

  tableOptions: CuiTableOptions;
  tableLimit = 10;
  tableOffset = 0;
  loading = false;
  updating = false;
  showPageDetails = true;
  totalItems = 0;
  tableData: any[] = [];
  jsonData: any[] = [];
  pageNumber = 0;
  isUserPm = true;
  isRevRecPo=false;
  isRevRecEngSox=false;
  isRevRecBu=false;
  userRole: string;
  role = Role;
  assignableUserList: any = [];
  dropdownUserList = [];
  selectedUser: any = {};
  searchText = "";
  searchPlaceholderText = 'Search project';
  pmProgressScoreText = {0: 'Not started', 100: 'Completed'};
  isAdmin = false;

  // speech -rec
  localUserRole: any;
  isSpeechRecStarted : boolean = false;

  ngOnInit() {
    this.userRole = this.userDetailsSerivce.userRole;
    this.isUserPm = this.userRole === this.role.pm;
    this.isRevRecPo= this.userRole === this.role.revRecPO;
    this.isRevRecEngSox= this.userRole === this.role.engSox;
    this.isRevRecBu= this.userRole === this.role.BUController;
    this.isAdmin = this.userDetailsSerivce.isAdminUser;
    this.getSearchPlaceholderText();
    this.createTableStructure();
    if (this.userRole === this.role.accessibilityPO || this.userRole === this.role.revRecPO) {
      this.getUsersByRole();
    }
  }

  /**
   * Get placeholder text according to logged in user
   */
  getSearchPlaceholderText() {
    switch(this.userRole) {
      case Role.accessibilityPO:
        this.searchPlaceholderText = "Search for Project, Owner or Assignee";
        break;
      case Role.revRecPO:
        this.searchPlaceholderText = "Search for Project, Owner, Business Unit or Assignee";
        break;
      case Role.smartLicensingPO:
      case Role.csdlPO:
      case Role.exportCompliancePO:
      case Role.communicationsRegulatoryPO:
      case Role.globalizationPO:  
        this.searchPlaceholderText =  "Search for Project or Owner";
        break;
      case Role.engSox:
      case Role.BUController:
        this.searchPlaceholderText =  "Search for Project, Owner or Business Unit";
        break;
    }
  }

  
  userNameVoiceSpeach(){
    this.localUserRole = JSON.parse(sessionStorage.getItem('userDetails'));
    this.localUserRole = this.localUserRole.name.split(" ")[0];
    if(sessionStorage.getItem('userLoggedIn')){
      sessionStorage.removeItem('userLoggedIn');
      this.textToSpeechService.speak(`Hello ${this.localUserRole}`);
      this.textToSpeechService.speak(`Welcome to CPDM NG Application`);
      setTimeout(() => {
        this.onListen();
      }, 5000);
    }
    
  }
  
  async onListen(){
    this.vocieRecService.start();
    this.isSpeechRecStarted = true;
    const speechToText = await this.vocieRecService.getResult();
    this.isSpeechRecStarted = false;
    console.log(speechToText);
    // debugger
    switch(speechToText){
      case 'create a project':
        case 'create a new project':
          case 'create new project':
        {
        this.vocieRecService.stop();
        this.onNavigateHome();
        break;
      }
      case 'cancel' :
        case 'stop' :{
          this.vocieRecService.stop();
          break;
        }
      default:{
        this.textToSpeechService.speak(`sorry I am not able to understand you, please try again`);
        setTimeout(() => {
          this.onListen();
        }, 2000);
        break;
      }
    }
  }

  onStopListen(){
    this.vocieRecService.stop();
  }
  
  onNavigateHome(){
    this.ngZone.run(() => this.router.navigate(['/project/create-project'])).then();
  }

  /**
   * Requests filtered projectcreateTableStructures if search keyword available o/w vise versa
   * @param text
   */
  onUpdate(text: string) {
    this.loading = true;
    this.searchText = text.trim();
    this.pageNumber = 1;
    this.tableOffset = 0;
    if (this.searchText && this.searchText.length) {
      this.searchProjectByKeyword();
    } else {
      this.createTableStructure();
    }
  }

  /**
   * Get users by role to populate "assigned to" dropdown list
   */
  getUsersByRole() {
    this.userDetailsSerivce.getUsersByRole(this.userRole).subscribe(users => {
      this.assignableUserList = users.data;
      this.dropdownUserList = JSON.parse(JSON.stringify(this.assignableUserList));
      // Commented to remove userId from dropdown list name
      // this.dropdownUserList.map(user => {
      //   user.name = `${user.name} (${user.userId})`;
      // });
    });
  }

  onUserSelection(userId, project) {
    this.loaderService.show();
    const [assignedUser] = this.assignableUserList.filter(user => user.userId == userId);
    const {userId: cecId} = assignedUser ? assignedUser : '';
    const assignedUserDetails = {
      projectId : project.projectId,
      assignedUser: assignedUser ? { name: assignedUser.name, cecId } : {},
      complianceItemId: project.complianceRefID
    };
    this.projectDetails.updateAssignedToUsers(assignedUserDetails).subscribe(res => {
      this.loaderService.hide();
      }, err => {

      }
    );
  }

  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    this.getAllProjectSubscription.unsubscribe();
    // *****************************************************/
  }

  createTableStructure() {
    this.getCards();
    const tableColums = [
      {
        name: 'Project Name',
        sortable: true,
        // key: 'name',
        template: this.getNameTemplate(),
      },
      {
        name: this.columnName,
        sortable: true,
        template: this.projectStatusTemplate
      },
      {
        // name: this.isUserPm ? 'Project Compliance' : 'View Compliance',
        name: this.lastColumnName,
        sortable: false,
        template: this.projectCompliance
      }
    ];
    if (this.userRole === this.role.accessibilityPO  ) {
    tableColums.splice(1, 0, {
      name: 'Project Owner',
      sortable: true,
      template: this.projectOwnerTemplate,
    });
    tableColums.splice(3, 0, {
      name: 'Assigned To',
      sortable: false,
      template: this.assignMembersTemplate
    });
  } else if (this.userRole === this.role.revRecPO){
    tableColums.splice(1, 0, {
      name: 'Project Owner',
      sortable: true,
      template: this.projectOwnerTemplate,
    });
    tableColums.splice(3, 0, {
      name: 'Assigned To',
      sortable: false,
      template: this.assignMembersTemplate
    });
    tableColums.splice(4, 0, {
      name: 'Business Unit',
      sortable: true,
      //key: 'rrBusinessUnit'
      template: this.rrBusinessUnitTemplate
    });
  }else if (this.userRole == this.role.BUController || this.userRole == this.role.engSox ) {
    tableColums.splice(1, 0, {
      name: 'Project Owner',
      sortable: true,
      template: this.projectOwnerTemplate
    });
    tableColums.splice(3, 0, {
      name: 'Business Unit',
      sortable: true,
     // key: 'rrBusinessUnit'
      template: this.rrBusinessUnitTemplate
    });
  }else if(this.userRole == this.role.smartLicensingPO || this.userRole == this.role.csdlPO || this.userRole == this.role.exportCompliancePO || 
    this.userRole == this.role.communicationsRegulatoryPO || this.userRole == this.role.globalizationPO){
    tableColums.splice(1, 0, {
      name: 'Project Owner',
      sortable: true,
      template: this.projectOwnerTemplate
    });
  } 
  else {
    tableColums.splice(3, 0, {
      name: 'Actions',
      sortable: false,
      template: this.actionTemplate,
    });
  }



    this.tableOptions = new CuiTableOptions({
      bordered: true,
      striped: false,
      hover: true,
      wrapText: false,
      padding: 'regular',
      selectable: false,
      singleSelect: false,
      checkboxDisabled: 'checkboxDisabled',
      dynamicData: true,
      updateParams: false,
      rowWellColor: 'bordered',
      limit: 10,
      offset: 1,
      columns: tableColums,
    });


  }

  get columnName() {
    if (this.userRole == this.role.pm) {
      return 'Project Status';
    }

    return 'Policy progress and status';
  }

  get lastColumnName() {
     if (this.userRole == this.role.pm) {
       return 'Project Compliance';
     } else if ( this.userRole == this.role.BUController || this.userRole == this.role.accessibilityPO
        || this.userRole == this.role.revRecPO || this.userRole == this.role.smartLicensingPO
        || this.userRole == this.role.csdlPO || this.userRole == this.role.exportCompliancePO 
        || this.userRole == this.role.communicationsRegulatoryPO || this.userRole == this.role.globalizationPO) {
       return 'View Compliance';
     } else if (this.userRole == this.role.engSox) {
       return 'Revenue Recognition';
     }
  }

  onPagerUpdated(pageInfo: any) {
    this.tableOffset = pageInfo.page;
    this.pageNumber = pageInfo.page + 1;
    // Requests filtered projects if search keyword available o/w vise versa
    if (this.searchText && this.searchText.length) {
      this.searchProjectByKeyword();
    } else {
      this.getCards();
    }
  }

  async getCards() {
    try {
      this.loading = true;
      this.tableData = [];

      if (this.pageNumber <= 0) {
        this.pageNumber = 1;
      }

      this.getProjects();
    } catch (err) {
      console.error(err);
      this.loading = false;
    }
  }

  getProjects() {
    this.getAllProjectSubscription = this.projectService.getProjects(this.pageNumber).subscribe(res => {
      this.createProjectData(res);
    }, _err => {
      this.totalItems = 0;
    });
  }

  /**
   * Get filtered projects by name, owner and assignee
   */
  searchProjectByKeyword() {
    this.getAllProjectSubscription = this.projectService.searchProjects(this.pageNumber, this.searchText).subscribe(res => {
      this.tableData = [];
      this.createProjectData(res);
    }, _err => {
      this.totalItems = 0;
      this.loading = false;
    });
    this.matomoTracker.trackEvent('HomePage','ProjectSearch',`searchText = ${this.searchText}`);
  }

  createProjectData(res) {
    this.totalItems = res.total;
    const resObj = Object.keys(res.docs).map(i => res.docs[i]);
    resObj.forEach(element => {
      const obj = {
        projectId: element._id,
        name: element.name,
        owners: element.owners ? element.owners : [],
        acceptors: element.acceptors ? element.acceptors : [],
        lastUpdatedDate: element.lastUpdatedDate,
        stream: element.stream,
        // nextCommit: 'N/A',
        progress: element.progress,
        status: element.progressStatus,
        complianceRefID: element.complianceRefID,
        compliance_id: element.compliance_id,
        complianceItems: element.complianceItems,
        rrBusinessUnit:element.rrBusinessUnit
      };
      this.tableData.push(obj);
      if (this.userRole == this.role.accessibilityPO || this.userRole == this.role.revRecPO) {
        this.selectedUser[obj.projectId] = obj.complianceItems && obj.complianceItems.assignedTo && obj.complianceItems.assignedTo.cecId ? obj.complianceItems.assignedTo.cecId : 'none';
      }
    });
    this.loading = false;
  }

  updatecomplianceItemsSortedData(project, event) {
    event.some(element => {
      if (project.compliance_id == element._id) {
        project.acceptors = [...element.acceptors];
        return true;
      }
    });
  }

  actionTaken(item) {
    const index = this.tableData.map(e => e.name).indexOf(item.name);
  }

  onTableSortingChanged($event) { }

  convartDate(date: Date) {
    const month_names = ['Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'];

    const day = date.getDate();
    const month_index = date.getMonth();
    const year = date.getFullYear();

    return '' + day + '-' + month_names[month_index] + '-' + year;
  }

  navigateTo(item) {
    this.projectDetails.selectedTabValue = null;
    if (this.userRole == this.role.pm) {
      this.router.navigate([`/project/${item.projectId}`]);
    } else if (this.userRole == this.role.accessibilityPO) {
      this.router.navigate([`/accessibility-process/${item.projectId}`]);
    } else if (this.userRole == this.role.revRecPO || this.userRole == this.role.BUController || this.userRole == this.role.engSox) {
      this.router.navigate([`/revenue-recognition/${item.complianceRefID}`]);
    } else if (this.userRole == this.role.smartLicensingPO) {
      this.router.navigate([`/smart-licensing/${item.complianceRefID}`]);
    } else if (this.userRole == this.role.csdlPO) {
      this.router.navigate([`/csdl/${item.complianceRefID}`]);
    } else if (this.userRole == this.role.exportCompliancePO) {
      this.router.navigate([`/export-compliance/${item.complianceRefID}`]);
    } else if (this.userRole == this.role.communicationsRegulatoryPO) {
      this.router.navigate([`/communications-regulatory/${item.complianceRefID}`]);
    }else if (this.userRole == this.role.globalizationPO) {
      this.router.navigate([`/globalization/${item.complianceRefID}`]);
    }
    this.matomoTracker.trackEvent('HomePage','ProjectView',`role = ${this.userRole}`);
  }

  getNameTemplate() {
    const roles = [this.role.pm, this.role.BUController, this.role.engSox, this.role.revRecPO, this.role.communicationsRegulatoryPO, this.role.globalizationPO ]
    if (roles.includes(this.userRole)) {
      return this.projectNamePMTemplate;
    }
    return this.projectNameTemplate;
  }
}
