import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Role } from '@cpdm-model/role';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material';
@Component({
  selector: 'app-user-search-dir',
  templateUrl: './user-search-dir.component.html',
  styleUrls: ['./user-search-dir.component.scss']
})
export class UserSearchDirComponent implements OnInit {

  @Output() selectedUsers = new EventEmitter();
  @Input() slObjData: any;

  userMembers = [] as any;
  inputValue: string;
  showLoader: boolean;
  getErrorMessage: string;
  errorOccurred: boolean;
  role = Role;
  @Input() initiateProcessContinues = true;
  @Input() sslWebinarValue: string;
  showMembers = true ;
  searchMember: FormControl = new FormControl();
  users = [];
  constructor(
    private userService: UserDetailsService
  ) { }

  ngOnInit() {
    this.searchMember.valueChanges.subscribe(
      async term => {
        this.users = [];
        this.errorOccurred = false;
        if ( term && (typeof term === 'string') && (term.trim()).length >= 3) {
          (await this.userService.searchUser(term)).subscribe(
          data => {
            this.users = (data && data.length > 0) ? data : [{"name": "No Record(s) Found", "cecId": null, "email": null}];            
          }, err => {
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

  ngOnChanges() {
    if (this.slObjData && this.slObjData.inputType === 'search') {
      this.userMembers = (this.slObjData.answer) ? this.slObjData.answer : [];
    }
    if (this.slObjData && this.slObjData.initiate) {
      if (this.slObjData.initiate.questionnaires && (this.slObjData.initiate.questionnaires.state).toLowerCase() === 'submitted') {
        this.initiateProcessContinues = false;
      }
      if (this.slObjData.initiate.questionnaires && this.slObjData.initiate.questionnaires.answers.length > 0 ) {
        this.slObjData.initiate.questionnaires.answers.forEach(element => {
          if (element.questionNumber == '2.a') {
            this.userMembers = (element.answer && element.answer.members) ? element.answer.members : [];
          }
          if (element.questionNumber == '2' && element.answer == 'yes') {
            this.showMembers = false;
          }
        });
      }
    }
    this.sslWebinarValue == 'no' ? this.showMembers = true : false;
  }

  async onMemberAddition() {
    this.showLoader = true;
    await this.addSelectedUserToMemberArray(this.inputValue);
  }

  setErrorMessage(err: string): void {
    this.errorOccurred = true;
    this.getErrorMessage = err;
  }

  onRemove(index) {
    this.userMembers.splice(index, 1);
    this.selectedUsers.emit(this.userMembers);
  }

  getSelectedUserName(selectedUser) {
    if (selectedUser) { return selectedUser.name; }
  }

  async addSelectedUserToMemberArray(selectedUser) {
    if ('errorStatus' in  selectedUser) {
      try {
        selectedUser = await this.userService.getUserDetailsFromDirectory(selectedUser.name).toPromise();
      } catch (err) {
        this.showLoader = false;
        return this.setErrorMessage('Invalid CEC Id');
      }
    }
    const userExist = this.userMembers.filter(member => {
      return member.id === selectedUser.cecId;
    });
    if (userExist.length === 0 ) {
      const merberObj = {name: selectedUser.name, id: selectedUser.cecId, fullname: selectedUser.name};
      this.userMembers.push( merberObj );
      this.inputValue = null;

      this.userMembers.forEach((obj, index) => {
        if (obj.name.split(' ')[1]) {
          this.userMembers[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
        } else {
          this.userMembers[index].name = `${obj.name.split(' ')[0]}`;
        }
        this.searchMember.reset();
        this.inputValue = null;
        this.showLoader = false;
        this.selectedUsers.emit(this.userMembers);
      });
    } else {
      this.setErrorMessage('User Already Exist');
      this.showLoader = false;
    }
  }

  matOptionSelected(selectedValue){
    if (selectedValue.cecId  || 'errorStatus' in  selectedValue) {
      this.inputValue = selectedValue;
    } else {
      this.inputValue = null;
    }
  }
}
