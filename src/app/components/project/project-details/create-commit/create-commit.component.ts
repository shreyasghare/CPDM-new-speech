import { Component, OnInit, OnChanges } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-commit',
  templateUrl: './create-commit.component.html',
  styleUrls: ['./create-commit.component.scss']
})
export class CreateCommitComponent implements OnInit {
  projectObj: any;
  items: any[] = [];
  selectAll = false;
  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
    // if(this.projectObj){
    //   for(let key in this.projectObj) {
    //     if(key == 'complianceItems' || key == 'technicalStandardItems' || key == 'additionalRequirements'){
    //       if(this.projectObj[key].length > 0)
    //         this.projectObj[key].forEach(element => {
    //           this.items.push(element);
    //         });
    //     }
    //   }
    // }
    if (this.projectObj) {
      this.items = this.projectObj.complianceItems;
    }
  }

  selectAllItems() {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].applicability = this.selectAll;
    }
  }

  checkIfAllSelected() {
    this.selectAll = this.items.every(function(item: any) {
        return item.applicability === true;
      });
  }

  saveCommit(commitObj) {
  }

  closeCommitModdal() {
    this.bsModalRef.hide();
  }
}
