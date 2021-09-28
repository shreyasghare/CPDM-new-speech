import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material';
import { async } from '@angular/core/testing';
@Component({
  selector: 'add-remove-member',
  templateUrl: './add-remove-member.component.html',
  styleUrls: ['./add-remove-member.component.scss']
})
export class AddRemoveMemberComponent implements OnInit, OnDestroy {

  @Input() members: any[] = [];
  @Input() header: string;
  @Input() getOwner = true;
  @Output() onValueChange: EventEmitter<any> = new EventEmitter();
  loggedInUser: any;
  inputValue: string;
  apiResponseReady: boolean;
  showLoader: boolean;
  getErrorMessage: string;
  errorOccurred: boolean;
  @Input('showMembers') numberOfMembersToBeShown = 2;
  @Input('isBtnInline') showButtonsInline = false;
  mailerGroupSubscription: Subscription;
  userDetailsSubscription: Subscription;
  @Input() isProjectOwner: boolean;
  @Input() createProject: boolean;
  // variable declaration for user autocomplete
  searchMember: FormControl = new FormControl();
  selectedMemberTypeTabIndex = 0; // 0  for CEC ID, 1 for mailer list
  users = [];
  inputUserObj = null;
  placeholderText:String = '';
  private _searchUserSubscription;
  private _searchMailerSubscription;
  constructor(public cuiModalService: CuiModalService, private userDetailsService: UserDetailsService) { }

  getCurrentOwner(): void {
    if (this.getOwner && this.userDetailsService.currentUserValue != null) {
      if (this.header.toLocaleLowerCase() === 'owner' && this.members.length < 1) {
        this.loggedInUser = this.userDetailsService.currentUserValue;
        this.members.push(this.loggedInUser);
        this.onValueChange.emit(this.members);
      }
    }
    return null;
  }

  getShortName(member) {
    const name =  member.name;
    if (member.name.length > 8 && !member.members) {
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ')[1];
      const lastNameShort = lastName.split('')[0];
      return `${firstName} ${lastNameShort}`;
    } else {
      return member.name;
    }
  }

  addMembersToArray(member: any): void {
    let duplicate: boolean;
    for (let index = 0; index < this.members.length; index++) {
      if (member.cecId === this.members[index].cecId) {
        duplicate = true;
        break;
      } else {
        duplicate = false;
      }
    }
    duplicate ? this.setErrorMessage('Already exists') : this.members.push(member);
    this.onValueChange.emit(this.members);
  }

  getMembersTooltip(members: []) {
    return members.join('\n').toString();
  }

  onRemove(index: number) {
   if (this.isOwnerCanRemove()) {
     this.members.splice(index, 1);
   }
  }

  isOwnerCanRemove(): boolean {
    if (this.isProjectOwner || this.createProject) {
      if (this.header.toLocaleLowerCase() == 'owner') {
        if (this.members.length > 1) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  }

  get getShowMore(): string {
    if (this.members.length >= this.numberOfMembersToBeShown) {
      return `${this.members.length - this.numberOfMembersToBeShown} More`;
    } else {
      return null;
    }
  }

  async onAdd(): Promise<void> {
    if (this.inputUserObj != null) {
      this.showLoader = true;
      if (this.selectedMemberTypeTabIndex === 1 ){        
        const mailerGroupDetail =  await this.userDetailsService.getMailerGroup(this.inputUserObj["name"]).toPromise();
        if (mailerGroupDetail) {
          const mailerGroup = {
            name: this.inputUserObj["name"],
            cecId: this.inputUserObj["cecId"],
            members: mailerGroupDetail
          };
          this.addMembersToArray(mailerGroup);
        } else {
          this.setErrorMessage('Mailer Group Not Found');
        }
      } else {
        if ('errorStatus' in  this.inputUserObj) {
          try {
            this.inputUserObj = await this.userDetailsService.getUserDetailsFromDirectory(this.inputUserObj['name']).toPromise();
          } catch (err) {
            this.showLoader = false;
            return this.setErrorMessage('Invalid CEC Id');
          }
        }
        this.addMembersToArray(this.inputUserObj);
      }
      this.inputValue = this.inputUserObj = null;
      this.searchMember.reset();
      this.showLoader = false;
    }
    return;
  }

  getErrorMessageFromStatus(err: any): string {
    let errorMsg;
    switch (err.status) {
      case 503:
        errorMsg = err.statusText;
        break;
      case 404:
        errorMsg = err.statusText;
        break;
      case 502:
        errorMsg = err.statusText;
      default:
        break;
    }

    return errorMsg;
  }

  setErrorMessage(err: string): void {
    this.errorOccurred = true;
    this.getErrorMessage = err;
    setTimeout(() => {
      this.clearErrorMessage();
      this.searchMember.reset();
      this.inputValue = null;
    }, 4000);
  }

  clearErrorMessage(): void {
    this.errorOccurred = false;
    this.getErrorMessage = '';
  }

  clearInputField(): void {
    this.inputValue = '';
  }

  showModal(content, normal): void {
      this.searchMember.reset();
      this.cuiModalService.show(content, normal);
  }

  hideModal(): void {
    this.cuiModalService.hide();
    this.clearErrorMessage();
  }

  getMailerIds(index): string {
    if (this.members[index].members !== undefined) {
      return this.members[index].members.toString();
    } else {
      // if(this.members[index].name.length > 10){
      //  return `${this.members[index].name.substring(0,10)}
      // }else{
        return this.members[index].name;
      // }

    }
  }


  ngOnInit() {
    this.getCurrentOwner();
    this.placeholderText = this.selectedMemberTypeTabIndex === 1 ? 'Search Mailers' : 'Search Users';
    this.searchMember.valueChanges.subscribe(
      async term => {        
        if(this._searchUserSubscription){
          this._searchUserSubscription.unsubscribe();
        }

        if(this._searchMailerSubscription){
          this._searchMailerSubscription.unsubscribe();
        }

        this.users = [];
        this.errorOccurred = false;
        if ( term && (typeof term === 'string') && (term.trim()).length >= 3) {
          if (this.selectedMemberTypeTabIndex === 1 ) {            
            this._searchMailerSubscription = (await this.userDetailsService.searchMailer(term.toLocaleLowerCase())).subscribe(
              data => {
                if (data && data.length > 0) {
                  const memberArray = [];
                  data.forEach(element => { // adding key to bind in UI, creating same obj as User
                    memberArray.push({
                      name: element,
                      cecId: element,
                      email: element
                    });
                  });
                  this.users = memberArray;
                } else {
                  this.users = [{"name": "No Record(s) Found", "cecId": null, "email": null}];
                }
              });
          } else {
            this._searchUserSubscription = (await this.userDetailsService.searchUser(term)).subscribe(
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
        }
    });
  }
  getSelectedUserName(selectedUser) {
    if (selectedUser) { return selectedUser.name; }
  }
  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    if (this._searchUserSubscription){
      this._searchUserSubscription.unsubscribe();
    }
    if(this._searchMailerSubscription) {
      this._searchMailerSubscription.unsubscribe();
    }
    // *****************************************************/
  }

  memberTypeTabChange(tabChangeEvent: MatTabChangeEvent): void {
    this.placeholderText = this.selectedMemberTypeTabIndex === 1 ? 'Search Mailers' : 'Search Users';
    this.searchMember.reset();
    this.inputValue = this.inputUserObj = null;
  }

  matOptionSelected(selectedValue){
    if (selectedValue.cecId ||  'errorStatus' in  selectedValue) {
      this.inputUserObj = this.inputUserObj = selectedValue;
    } else {
      this.inputUserObj = this.inputUserObj = null;
    }
  }
}
