import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-edit-acceptor-owner-pop-up',
  templateUrl: './edit-acceptor-owner-pop-up.component.html',
  styleUrls: ['./edit-acceptor-owner-pop-up.component.scss']
})
export class EditAcceptorOwnerPopUpComponent implements OnInit {
  projectObj: any = {};
  members = [] as any;
  owner = false;
  acceptor = false;
  loadingAcceptorOwner = false;
  acceptorOwnerUpdateSatus = false;

  onClose: any;

  loggedInUser: any;
  inputValue: string;
  apiResponseReady: boolean;
  showLoader: boolean;
  getErrorMessage: string;
  errorOccurred: boolean;
  typeView: boolean;
  searchMember: FormControl = new FormControl();
  selectedMemberTypeTabIndex = 0; // 0  for CEC ID, 1 for mailer list
  users = [];

  disableSave = false;

  constructor(public bsModalRef: BsModalRef,
              private userService: UserDetailsService,
              private route: ActivatedRoute,
              private projectDetails: ProjectsDetailService) { }

  ngOnInit() {
    this.acceptor != this.owner;
    if (this.projectObj.owners) {
      this.owner = true;
    } else if (this.projectObj.acceptors) {
      this.acceptor = true;
    }

    this.updateMemberArray();

    this.searchMember.valueChanges.subscribe(
      async term => {
        this.users = [];
        this.errorOccurred = false;
        if ( term && (typeof term === 'string') && (term.trim()).length >= 3) {
          (await this.userService.searchUser(term)).subscribe(
          data => {
            this.users = (data && data.length > 0) ? data : [{"name": "No Record(s) Found", "cecId": null, "email": null}];
          },
          err => {
            this.users = [{
              'name': this.searchMember.value,
              'cecId': null,
              'email': null,
              'errorStatus': err
            }] ;
          });
        }
    });
  }
  
  getSelectedUserName(selectedUser) {
    if (selectedUser) { return selectedUser.name; }
  }

  async onMemberAddition() {
    this.showLoader = true;
    await this.addSelectedUserToMemberArray(this.inputValue);
    this.showLoader = false;
  }

  async addSelectedUserToMemberArray(selectedUser) {
    if ('errorStatus' in  selectedUser) {
      try {
        selectedUser = await this.userService.getUserDetailsFromDirectory(selectedUser.name).toPromise();
      } catch (err) {
        console.error(err);
        return this.setErrorMessage('Invalid CEC Id');
      }
    }
    const userExist = this.members.filter(member => {
      return member.id === selectedUser.cecId;
    });

    if (userExist.length === 0 ) {
      const merberObj = {name: selectedUser.name, id: selectedUser.cecId, fullname: selectedUser.name};
      this.members.push( merberObj );
      this.inputValue = null;
      this.searchMember.reset();
      this.members.forEach((obj, index) => {
        if (obj.name.split(' ')[1]) {
          this.members[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
        } else {
          this.members[index].name = `${obj.name.split(' ')[0]}`;
        }
      });

    } else {
      this.setErrorMessage('User Already Exist');
    }
  }

  setErrorMessage(err: string): void {
    this.errorOccurred = true;
    this.getErrorMessage = err;
    setTimeout(() => {
      this.errorOccurred = false;
      this.getErrorMessage = '';
    }, 4000);
  }


  onRemove(index) {
    this.disableSave = true;
    this.members.splice(index, 1);
  }

  onSave() {
    this.loadingAcceptorOwner = true;
    const object = {
      projectId : this.projectObj.projectId,
      complianceItemName: this.projectObj.name,
      complianceItemId: this.projectObj.complianceItemId,
      memberType: '',
      members: this.members,
      complianceType: this.projectObj.complianceType
    };
    if (this.projectObj.owners) {
      object.memberType = 'Owner';
    }
    if (this.projectObj.acceptors) {
      object.memberType = 'Acceptor';
    }

    this.projectDetails.updateAcceptorOwner(object).subscribe(
      data => {
        this.loadingAcceptorOwner = false;
        this.acceptorOwnerUpdateSatus = false;
        this.projectDetails.setProjectDetails(data);
        this.onClose(data);
        // this.bsModalRef.hide();
        // this.members = this.projectObj.owners;
      },
      err => {
        this.loadingAcceptorOwner = false;
        this.acceptorOwnerUpdateSatus = true;
        this.updateMemberArray();
      }
    );
  }

  updateMemberArray() {
    if (this.projectObj.owners) {
      this.members = JSON.parse(JSON.stringify(this.projectObj.owners)); // this.projectObj.owners;//
    } else if (this.members = this.projectObj.acceptors) {
      this.members =  JSON.parse(JSON.stringify(this.projectObj.acceptors)); // this.projectObj.acceptors; //
    }
    this.members.forEach((obj: any, index) => {
      this.members[index].fullname = obj.fullname;
      if (obj.name.split(' ')[1]) {
        this.members[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
      } else {
        this.members[index].name = `${obj.name.split(' ')[0]}`;
      }
    });
  }

  matOptionSelected(selectedValue){
    if (selectedValue.cecId || 'errorStatus' in  selectedValue) {
      this.inputValue = selectedValue;
    } else {
      this.inputValue = null;
    }
  }
}
