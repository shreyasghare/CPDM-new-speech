import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { GlobalizationService } from '@cpdm-service/additional-requirements/globalization/globalization.service';
import { GlobalizationModel, CheckListModel, ServiceRequestModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-gz-requirement-checklist-modal',
  templateUrl: './gz-requirement-checklist-modal.component.html',
  styleUrls: ['./gz-requirement-checklist-modal.component.scss']
})
export class GzRequirementChecklistModalComponenet implements OnInit, OnDestroy {

  checkListForm = new FormGroup({
    requirementChkList1: new FormControl('', [Validators.required]),
    requirementChkList2: new FormControl('', [Validators.required]),
    requirementChkList3: new FormControl('', [Validators.required]),
    requirementChkList4: new FormControl('', [Validators.required]),
    requirementChkList5: new FormControl('', [Validators.required]),
    requirementChkList6: new FormControl('', [Validators.required]),
    engineeringPOC: new FormControl('', [Validators.required])
  });

  importantNote = `<div class="important-note-color"><span>Important:</span>
                  <ul class="ml-1"><li>Please go to the <a class="text-link" href="https://ibpm.cisco.com/cpe/sr/login/qDDyXNoEv0RP6tigJaHDPQ%5b%5b%2a/%21STANDARD" target="_blank">Localization request tool (LME)</a></u> to upload all source or reference files.</li>
                  <li class="mt-1 mb-1">We recommend that all Globalization service requesters secure a budget from their respective organization before submitting a service request in <a class="text-link" target="_blank">LME</a>, our service request tool.</li>
                  <li> Email the Globalization & Translation Services <a class="text-link" href="mailto:globalgts-eng-mgrs@cisco.com" target="_blank">globalgts-eng-mgrs@cisco.com</a> if you have questions or comments.</li></ul></div>`;
  translationTitle = '(Attach all documents and files in the <a class="text-link" href="https://ibpm.cisco.com/cpe/sr/login/qDDyXNoEv0RP6tigJaHDPQ%5b%5b%2a/%21STANDARD" target="_blank">Localization request tool (LME)</a>)';
  isSpinner = false;
  completedFlag: boolean;
  hasPocCecId: boolean;
  disablePocCecId = true;
  answeredCheckListArr = [];
  checkListArr: CheckListModel[];
  checkListItemStatus: string;
  checkLitStatus: string;
  checklistSection;
  globalizationDetails :GlobalizationModel;
  answeredCount: number;
  totalChkListItems: number;
  remainingCheKlistCount:number;
  destroy$ = new Subject();
  searchUserSubscription: Subscription;
  dropdownUsers: {name: string, cecId: string, email: string, errorStatus: string}[];
  selectedUser = {
    engineeringPOC: null
  };

  selectedUserList = {
    engineeringPOC: []
  };

  constructor(
              private dialogRef: MatDialogRef<any>,
              private userDetailsService: UserDetailsService,
              private globalizationService: GlobalizationService,
              private toastService: ToastService,
              @Inject(MAT_DIALOG_DATA) public data: any
              ) {}

  ngOnInit() {
    this.accountableExecutiveChanged();
    this.getGlobalizationDetails();
  }


  getGlobalizationDetails() {
    this.isSpinner = true;
    this.globalizationService.getGlobalizationData(this.data.globalizationData._id).pipe(takeUntil(this.destroy$)).subscribe(globalizationData => {
      this.globalizationDetails = globalizationData.data;
      this.checklistSection = this.globalizationDetails.requirements.requirementsChecklist.checklistSection;
      this.remainingCheKlistCount = this.checklistSection.mandatoryQuestionsYetToBeAnswered;
      this.answeredCount = this.checklistSection.noOfQuestionsAnswered;
      this.checkListArr = this.checklistSection.checklist;
      this.totalChkListItems = 6;
      this.checkListArr.forEach(arrRes => {
        const formControlvalue = 'requirementChkList' + arrRes.checklistNumber;
        const pocCecId = arrRes.pocCecId;
      
        this.checkListForm.get(formControlvalue).setValue(arrRes.checklistSelected);
        if (arrRes.checklistNumber === 5 && pocCecId) {
          this.selectedUserList.engineeringPOC.push(pocCecId);
          this.hasPocCecId = true;
          this.disablePocCecId = true;
        } else if (pocCecId === ''){
          this.hasPocCecId = false;
          this.disablePocCecId = false;
        }
        
        //this.checkListForm.get('engineeringPOC').setValue(pocCecId); 
      });
      this.getRemainingQuestionCount();
      this.isSpinner = false;
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching Globalization details', 'danger');
      this.isSpinner = false;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  accountableExecutiveChanged() {
    this.checkListForm.get('engineeringPOC').valueChanges
    .pipe(debounceTime(500))
    .subscribe(searchText => {
      if (typeof searchText === 'string') {
        this.getUsers(searchText, 'engineeringPOC');
      }
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
            'name': this.checkListForm.value[fieldKey],
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
    this.checkListArr.forEach(element => {
      if (element.checklistNumber === 5) {
        element.pocCecId = this.selectedUser[fieldKey].cecId;
      }
    });
    this.selectedUser[fieldKey] = null;
    this.checkListForm.get(fieldKey).patchValue(" ");
    this.hasPocCecId = true;
    this.getRemainingQuestionCount();
  }

  /**
   * @description Removes user from the list and updates unanswered question count
   * @param index
   * @param fieldKey
   */
  removeUser(index: number, fieldKey: string) {
    this.selectedUserList[fieldKey].splice(index, 1);
    this.disablePocCecId = false;
    this.checkListArr.forEach(element => {
      if (element.checklistNumber === 5) {
        element.pocCecId = '';
        if (!element.checklistSelected) {
          this.disablePocCecId = true;
        }
      }
    });
    this.hasPocCecId = false;
    this.getRemainingQuestionCount();
  }

  getRemainingQuestionCount() {
    this.answeredCheckListArr = this.checkListArr.filter(chkList => {
      if (chkList.checklistNumber !== 5 && chkList.checklistSelected) {
        return chkList;
      } else if (chkList.checklistNumber === 5 && this.hasPocCecId) {
        return chkList;
      }
    });
    this.remainingCheKlistCount = this.totalChkListItems;
    if (this.answeredCheckListArr.length > 0) {
      this.remainingCheKlistCount = this.totalChkListItems - this.answeredCheckListArr.length;
    }
    this.getUpdatedQuestionnaireStatus();
  }

  getUpdatedQuestionnaireStatus() {
    if (this.remainingCheKlistCount === 0) {
      this.checkListItemStatus = `All 6 requirements are checked`;
      this.completedFlag = true;
      this.checkLitStatus = 'submitted';
    } else {
      this.checkListItemStatus = `${this.remainingCheKlistCount} ${this.remainingCheKlistCount === 1 ? 'requirement is' : 'requirements are'} remaining to be checked (completed)`;
      this.checkLitStatus = 'saved';
      this.completedFlag = false;
    }
  }

  onAddingCheckListItems(event,value) {
    let isQuestionExists = false;
    let questionIndex =  0;
    this.checkListArr.forEach(ele => {
      if(ele.checklistNumber === value) {
        ele.checklistSelected = event.checked;
        if (ele.checklistNumber === 5) {
          if (event.checked) {
            this.disablePocCecId = false;
          } else {
            this.disablePocCecId = true;
            this.removeUser(0,'engineeringPOC');
          }
          
        }
        if (this.answeredCheckListArr.length > 0) {
          this.answeredCheckListArr.filter((array, idx) => {
            if (!array.checklistSelected) {
                questionIndex = idx;
                isQuestionExists = true;
            }
          });
        }
      }

      if (isQuestionExists) {
        this.answeredCheckListArr.splice(questionIndex, 1);
      }
    });
    
   this.getRemainingQuestionCount();
  }
  saveChekList() {
    const requestObj = {
      projectId: this.globalizationDetails._id,
      noOfQuestionsAnswered: this.answeredCheckListArr.length, 
      mandatoryQuestionsYetToBeAnswered: this.remainingCheKlistCount,
      completedFlag: this.completedFlag, 
      checklist: this.checkListArr,
      status: this.checkLitStatus
    }
    this.isSpinner = true;
    this.globalizationService.saveRequirementCheckListItems(this.globalizationDetails._id, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      const { success, data } = strategyRes;
      if (strategyRes && strategyRes.success) {
        this.isSpinner = false;
        // this.toastService.show('Success', 'Requirement Checklist has been submitted successfully', 'success');
        this.dialogRef.close({ success: true, data });
      }
    }, (err) => {
      this.answeredCheckListArr = [];
      // this.toastService.show('Error in updating', 'Unable to save Requirement Checklist', 'danger');
    });
  }

  ngOnDestroy() {
  
  }
}
