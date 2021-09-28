import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.scss']
})
export class ApproveRejectComponent implements OnInit {
  onAction = new EventEmitter();
  isInvalid = false;
  comment = '';

  constructor( public dialogRef: MatDialogRef<ApproveRejectComponent>,
               @Inject(MAT_DIALOG_DATA) public data: {
                 isPmScreen: boolean
               }
               ) { }

  ngOnInit() {
  }

  onApprove() {
    this.submit('approved', false);
  }

  onReject() {
    this.submit('rejected');
  }

  private submit(type: string, validation = true): void {
    if (this.comment !== '' || !validation) {
      this.onAction.emit({ type, comment: this.comment });
    } else {
      this.isInvalid = true;
    }
  }

  private descriptionChanged(event) {
    this.comment = event.trim();
  }

}
