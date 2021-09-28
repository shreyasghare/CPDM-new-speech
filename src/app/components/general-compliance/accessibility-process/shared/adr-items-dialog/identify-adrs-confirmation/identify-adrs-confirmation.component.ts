import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-identify-adrs-confirmation',
  templateUrl: './identify-adrs-confirmation.component.html',
  styleUrls: ['./identify-adrs-confirmation.component.scss']
})
export class IdentifyAdrsConfirmationComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<IdentifyAdrsConfirmationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                adrsPresent: boolean, showApprovalScreen: boolean
              }) { }

  ngOnInit() {
  }

  onNo() {
    this.dialogRef.close(false);
  }

  onYes() {
    this.dialogRef.close(true);
  }

}
