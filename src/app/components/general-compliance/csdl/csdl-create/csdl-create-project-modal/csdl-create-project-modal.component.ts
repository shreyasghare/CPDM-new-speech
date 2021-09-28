import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { CsdlProjectModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { environment } from 'src/environments/environment';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-csdl-create-project-modal',
  templateUrl: './csdl-create-project-modal.component.html',
  styleUrls: ['./csdl-create-project-modal.component.scss']
})
export class CsdlCreateProjectModalComponent implements OnInit, OnDestroy {
  projectDetails: CsdlProjectModel;
  isDetailsConfirmed: boolean;
  projectName: string;
  siHomeLink: string;
  siProjectLink: string;
  createProjectForm = new FormGroup({
    project_name: new FormControl('', [Validators.required]),
    be_sbe_pf: new FormControl('', [Validators.required]),
    accountable_executive: new FormControl('', [Validators.required]),
    technical_leads: new FormControl('', [Validators.required]),
    product_managers: new FormControl('', [Validators.required]),
    program_managers: new FormControl('', [Validators.required]),
    hw_sw_type: new FormControl('', [Validators.required]),
    sw_version: new FormControl({value: '', disabled: true}, [Validators.required])
  });
  hwSwTypes = [
    {
      label: 'Hardware',
      value: 'Hardware'
    }, {
      label: 'Software',
      value: 'Software'
    }, {
      label: 'Hardware and Software',
      value: 'Hardware and Software'
    }
  ];
  beSbePfList: {label: string, value: string}[];
  loadingBeSbePf: boolean;
  dropdownUsers: {name: string, cecId: string, email: string, errorStatus: string}[];
  debounceTime = 500;
  selectedUser = {
    accountable_executive: null,
    technical_leads: null,
    product_managers: null,
    program_managers: null
  };
  selectedUserList = {
    accountable_executive: [],
    technical_leads: [],
    product_managers: [],
    program_managers: []
  };
  totalQuestionsCount: number;
  remainingQuestionsCount: number;
  isFormDataChanged = false;
  showConfirmationSection = false;
  showLoader = false;
  invalidUser: string;
  invalidProjectName:string = null;
  getBeSbePfListSubscription: Subscription;
  searchUserSubscription: Subscription;
  createCSDLProjectSubscription: Subscription;

  constructor(private dialogRef: MatDialogRef<any>,
              private userDetailsService: UserDetailsService,
              private toastService: ToastService,
              private csdlService: CsdlService,
              @Inject(MAT_DIALOG_DATA) private data: { projectDetails: CsdlProjectModel, isDetailsConfirmed: boolean, projectName: string, owners: { cecId: string, members: string[] }[]}) {}

  ngOnInit() {
    this.isDetailsConfirmed = this.data.isDetailsConfirmed;
    if (!this.isDetailsConfirmed) {
      this.totalQuestionsCount = Object.keys(this.createProjectForm.controls).filter(key => {
        return this.createProjectForm.controls[key].enabled;
      }).length;
      this.createProjectForm.get('project_name').patchValue(this.data.projectName);
      this.siHomeLink = `${environment.csdlManageSIHomeLink}`;
      this.getBeSbePfList();
      this.populateUserList();
      this.triggerFormControlChanges();
      this.getRemainingQuestionCount();
    } else {
      this.projectDetails = this.data.projectDetails;
      this.siProjectLink = `${environment.csdlManageSIHomeLink}${environment.csdlManageSIProjectLink}`.replace("_id", this.projectDetails.project_id && this.projectDetails.project_id.toString());
    }
  }

  /**
   * @description Loads project owners as product and program managers
   */
  populateUserList() {
    this.data.owners.forEach(item => {
      // Group ids should not be included
      if (!item.members) {
        this.selectedUserList.product_managers.push(item.cecId);
        this.selectedUserList.program_managers.push(item.cecId);
      }
    });
  }

  /**
   * @description get list of Business Entity // Sub Business Entity // Product Family
   */
  private getBeSbePfList() {
    this.loadingBeSbePf = true;
    this.getBeSbePfListSubscription = this.csdlService.getBeSbePfList().subscribe(res => {
      this.beSbePfList = [...res.data];
      this.loadingBeSbePf = false;
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching the BE//SBE//PF list', 'danger');
    });
  }

  /**
   * @description triggers on change of form control values
   */
  private triggerFormControlChanges() {
    this.formValueChanged();
    this.accountableExecutiveChanged();
    this.technicalLeadsChanged();
    this.productManagersChanged();
    this.programManagersChanged();
    this.hwSwTypeChanged();
  }

  /**
   * @description Gets unanswered questions count on change of form control values
   */
  private formValueChanged() {
    this.createProjectForm.valueChanges.subscribe(x => {
      this.isFormDataChanged = true;
      this.getRemainingQuestionCount();
    });
  }

  /**
   * @description Requests user list by search keyword on change of accountable_executive form control value
   */
  private accountableExecutiveChanged() {
    this.createProjectForm.get('accountable_executive').valueChanges
    .pipe(debounceTime(this.debounceTime))
    .subscribe(searchText => {
      if (typeof searchText === 'string') {
        this.getUsers(searchText, 'accountable_executive');
      }
    });
  }

  /**
   * @description Requests user list by search keyword on change of technical_leads form control value
   */
  private technicalLeadsChanged() {
    this.createProjectForm.get('technical_leads').valueChanges
    .pipe(debounceTime(this.debounceTime))
    .subscribe(searchText => {
      if (typeof searchText === 'string') {
        this.getUsers(searchText, 'technical_leads');
      }
    });
  }

  /**
   * @description Requests user list by search keyword on change of product_managers form control value
   */
  private productManagersChanged() {
    this.createProjectForm.get('product_managers').valueChanges
    .pipe(debounceTime(this.debounceTime))
    .subscribe(searchText => {
      if (typeof searchText === 'string') {
        this.getUsers(searchText, 'product_managers');
      }
    });
  }

  /**
   * @description Requests user list by search keyword on change of program_managers form control value
   */
  private programManagersChanged() {
    this.createProjectForm.get('program_managers').valueChanges
    .pipe(debounceTime(this.debounceTime))
    .subscribe(searchText => {
      if (typeof searchText === 'string') {
        this.getUsers(searchText, 'program_managers');
      }
    });
  }

  /**
   * @description enable/disable sw_version field based on hw_sw_type selected value
   */
  private hwSwTypeChanged() {
    this.createProjectForm.get('hw_sw_type').valueChanges.subscribe(item => {
      if (!item || item === 'Hardware') {
        this.createProjectForm.get('sw_version').disable();
        this.createProjectForm.get('sw_version').patchValue('');
      } else {
        this.createProjectForm.get('sw_version').enable();
      }
      this.createProjectForm.updateValueAndValidity();
      this.totalQuestionsCount = Object.keys(this.createProjectForm.controls).filter((key)=>{
        return this.createProjectForm.controls[key].enabled;
      }).length;
    });
  }

  /**
   * @description Fetch user list by reuested search keyword
   * @param searchText
   * @param fieldKey
   */
  private async getUsers(searchText: string, fieldKey: string) {
    this.dropdownUsers = [];
    if (searchText && searchText.trim().length >= 3) {
      this.searchUserSubscription = (await this.userDetailsService.searchUser(searchText)).subscribe(userList => {
        // Removing already added users from list to avoid duplicate entries
        userList.forEach((user: {cecId: string}, index: boolean) => {
          if (this.selectedUserList[fieldKey].indexOf(user.cecId) !== -1) {
            userList.splice(index, 1);
          }
        });
        this.dropdownUsers = userList && userList.length > 0 ? userList : [{"name": "No Record(s) Found", "cecId": null, "email": null}];            
      }, err => {
        this.toastService.show('Error in data fetching', 'Error fetching the requested user', 'danger');
        this.dropdownUsers = [{
          'name': this.createProjectForm.value[fieldKey],
          'cecId': null,
          'email': null,
          'errorStatus': err
        }] ;
      });
    }
  }

  /**
   * @description Set value to mat-autocomplete's displayWith property
   * @param selectedUser
   */
  getSelectedUserName(selectedUser: {name: string, cecId: string, email: string}) {
    if (selectedUser) { return selectedUser.cecId; }
  }

  /**
   * @description Get selected option from the list
   * @param selectedValue
   */
  selectMatOption(selectedValue: {name: string, cecId: string, email: string}, fieldKey: string){
    this.selectedUser[fieldKey] = selectedValue.cecId ? selectedValue : null;
  }

  /**
   * @description List all the selected users
   * @param fieldKey
   */
  addSelectedUsers(fieldKey: string) {
    this.selectedUserList[fieldKey].push(this.selectedUser[fieldKey].cecId);
    this.selectedUser[fieldKey] = null;
    this.createProjectForm.get(fieldKey).patchValue(" ");
  }

  /**
   * @description Removes user from the list and updates unanswered question count
   * @param index
   * @param fieldKey
   */
  removeUser(index: number, fieldKey: string) {
    this.selectedUserList[fieldKey].splice(index, 1);
    this.getRemainingQuestionCount();
  }

  /**
   * @description Create new CSDL project and links id
   */
  createProject() {
    const requestObj = this.createRequestObject();
    this.showLoader = true;
    this.createCSDLProjectSubscription = this.csdlService.createCSDLProject(requestObj).subscribe(res => {
      this.showLoader = false;
      this.dialogRef.close(res);
      this.toastService.show('Details confirmed', `The <b>${requestObj.project_name}</b> with CSDL ID <b>${res.data.csdlProjectId}</b> is successfully created and linked. Click 'View details' to see project details.`, 'success');
    }, err => {
      this.showLoader = false;
      if (getNestedKeyValue(err, 'error', 'data', 'detail')) {
        let message = err.error.data.detail;
        if(message.includes(":")){
          this.invalidProjectName=null;
          this.invalidUser = err.error.data.detail.split(':')[1].trim();
        }else{
          this.invalidUser =null;
          this.invalidProjectName = err.error.data.detail.split(':')[0].trim();
        }
      }
    });
  }

  /**
   * @description Creates final json object required to create new CSDL project
   */
  private createRequestObject() {
    const requestObj = {...this.createProjectForm.value};
    requestObj._id = this.csdlService.CsdlID;
    requestObj.accountable_executive = this.selectedUserList.accountable_executive.join();
    requestObj.technical_leads = this.selectedUserList.technical_leads.join();
    requestObj.product_managers = this.selectedUserList.product_managers.join();
    requestObj.program_managers = this.selectedUserList.program_managers.join();
    requestObj.project_type = 'on-premise';
    requestObj.project_status = 'concept';
    return requestObj;
  }

  /**
   * @description Gets updated unanswered question count
   */
  private getRemainingQuestionCount() {
    this.remainingQuestionsCount = this.totalQuestionsCount;
    const requestObj = this.createRequestObject();
    Object.keys(this.createProjectForm.controls).forEach(item => {
      if (requestObj[item]) {
        this.remainingQuestionsCount --;
      }
    });
  }

  /**
   * @description If form data changed, It ask for confirmation before modal closes
   */
  confirmClose() {
    this.isFormDataChanged ? this.showConfirmationSection = true : this.closeModal();
  }

  /**
   * @description Closes project modal
   */
  closeModal() {
    this.dialogRef.close();
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    if (this.getBeSbePfListSubscription) {
      this.getBeSbePfListSubscription.unsubscribe();
    }
    if (this.searchUserSubscription) {
      this.searchUserSubscription.unsubscribe();
    }
    if (this.createCSDLProjectSubscription) {
      this.createCSDLProjectSubscription.unsubscribe();
    }
  }
}
