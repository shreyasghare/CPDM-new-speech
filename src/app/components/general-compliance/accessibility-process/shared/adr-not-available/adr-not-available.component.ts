import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';

@Component({
  selector: 'app-adr-not-available',
  templateUrl: './adr-not-available.component.html',
  styleUrls: ['./adr-not-available.component.scss']
})
export class AdrNotAvailableComponent implements OnInit {
  objectDetails: any;
  notApplicableItems: any = [];
  adrSelected: boolean;
  allAdrSelected = false;
  notApplicableItemsSelected: any = [];
  onClose: any;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private accessibilityService: AccessibilityProcessService) { }

  ngOnInit() {

    // this.accessibilityService.getTableData(this.objectDetails.tabClicked).subscribe(res => {
    //   this.notApplicableItems = res.filter((elem) => !this.objectDetails.adrItems.find(({ refId }) => elem._id === refId));
    // });
  }

  selectAllNaAdrs(event) {
    if (event.target.checked) {
      this.adrSelected = true;
      this.notApplicableItemsSelected = this.notApplicableItems;
    } else {
      this.adrSelected = false;
      this.notApplicableItemsSelected = [];
    }
  }

  selectCheckedAdr(event, adrItem) {
    this.allAdrSelected = false;
    if (event.target.checked) {
      this.notApplicableItemsSelected.push(adrItem);
    } else {
      this.notApplicableItemsSelected = this.notApplicableItemsSelected.filter(item => item._id != adrItem._id);
    }

  }

  submitSelectedAdrs() {
    this.onClose(this.notApplicableItemsSelected);
  }
  modalPopupClose() {
    this.bsModalRef.hide();
  }
}
