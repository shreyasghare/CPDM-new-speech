import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { EditAcceptorOwnerPopUpComponent } from '../edit-acceptor-owner-pop-up/edit-acceptor-owner-pop-up.component';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';

@Component({
  selector: 'app-edit-acceptor-owner',
  templateUrl: './edit-acceptor-owner.component.html',
  styleUrls: ['./edit-acceptor-owner.component.scss']
})
export class EditAcceptorOwnerComponent implements OnInit, OnChanges {
  bsModalRef: BsModalRef;
  @Input() memberObj: any = {};
  @Output() complianceItems = new EventEmitter();
  members: any[] = [];
  constructor(private modalService: BsModalService,
              private projectDetails: ProjectsDetailService) { }

  ngOnInit() {
    this.initMember();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.memberObj.firstChange) {
      this.initMember();
    }
  }

  initMember() {
    if (this.memberObj.acceptors && this.memberObj.acceptors.length) {
      this.members = JSON.parse(JSON.stringify(this.memberObj.acceptors)); // this.memberObj.acceptors;
    }
    if (this.memberObj.owners && this.memberObj.owners.length) {
      this.members = JSON.parse(JSON.stringify(this.memberObj.owners)); // this.memberObj.owners;
    }
    this.members.forEach((obj: any , index) => {
        if (obj.name.split(' ')[1]) {
        this.members[index].fullName = this.members[index].name;
        this.members[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
      } else {
        this.members[index].fullName = this.members[index].name;
        this.members[index].name = `${obj.name.split(' ')[0]}`;
      }
    });
  }

  showModal() {
    const initialState = {
      projectObj: this.memberObj
    };
    this.bsModalRef = this.modalService.show(EditAcceptorOwnerPopUpComponent, { class: 'bsModalStyle', initialState });
    this.bsModalRef.content.onClose = (returnedData) => {
      // if (returnedData.complianceItems) {
      if (this.memberObj.complianceType === 'technicalStandard') {
        this.complianceItems.emit(combineCompilanceItems(returnedData.technicalStandardItems, [], this.memberObj.complianceType));
      } else {
        this.complianceItems.emit(combineCompilanceItems(returnedData.complianceItems,
          returnedData.additionalRequirements,
          this.memberObj.complianceType));
      }
      this.bsModalRef.hide();
    };
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onRemove(index) {
    this.members.splice(index, 1);

    const object = {
      projectId : this.memberObj.projectId,
      complianceItemName: this.memberObj.name,
      memberType: '',
      members: this.members,
      complianceType: this.memberObj.complianceType,
      complianceItemId: this.memberObj.complianceItemId,
    };
    if (this.memberObj.owners && this.memberObj.owners.length) {
      object.memberType = 'Owner';
    }
    if (this.memberObj.acceptors && this.memberObj.acceptors.length) {
      object.memberType = 'Acceptor';
    }

    this.projectDetails.updateAcceptorOwner(object).subscribe(
      data => {
        this.projectDetails.setProjectDetails(data);
        if (this.memberObj.complianceType == 'technicalStandard') {
          this.complianceItems.emit(combineCompilanceItems(data.technicalStandardItems, [], this.memberObj.complianceType));
        } else {
          this.complianceItems.emit(combineCompilanceItems(data.complianceItems, data.additionalRequirements, this.memberObj.complianceType));
        }
      },
      err => {
        if (this.memberObj.acceptors && this.memberObj.acceptors.length) {
          this.members = JSON.parse(JSON.stringify(this.memberObj.owners)); // this.memberObj.acceptors;
        }
        if (this.memberObj.owners && this.memberObj.owners.length) {
          this.members = JSON.parse(JSON.stringify(this.memberObj.acceptors)); // this.memberObj.owners;
        }
      }
    );
  }

  showViewModal() {
    const initialState = {
      projectObj: this.memberObj,
      typeView: true
    };
    this.bsModalRef = this.modalService.show(EditAcceptorOwnerPopUpComponent, { class: 'bsModalStyle', initialState });
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}

function combineCompilanceItems(complianceItems, additionalRequirements, complianceType) {
  // if(complianceItems){
  //   complianceItems.forEach(element => {
  //     element['complianceType'] = 'general'
  //   });
  // }
  // if(additionalRequirements){
  //   additionalRequirements.forEach(element => {
  //     element['complianceType'] = 'additional'
  //   });
  //   return complianceItems.concat(additionalRequirements);
  // }
  if (complianceType == 'technicalStandard') {
    complianceItems.forEach(element => {
          element.complianceType = 'technicalStandard';
        });
  } else {
    complianceItems.forEach(element => {
          element.complianceType = 'general';
        });
    if (additionalRequirements) {
      additionalRequirements.forEach(element => {
        element.complianceType = 'additional';
      });
      return complianceItems.concat(additionalRequirements);
    }
  }
  return complianceItems;
}
