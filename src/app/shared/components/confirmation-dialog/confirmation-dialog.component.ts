import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  showLoader = false;
  onConfirmAction = new EventEmitter();
  header: string;
  body: string;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: {header: string, confirmationText: string}) { }

  ngOnInit() {
    const { header = 'Confirm action', confirmationText: body } = this.data;
    this.header = header;
    this.body = body;
  }

  onCancel(): void {
    this.dialogRef.close({success: false});
  }

  onConfirm(): void {
    this.showLoader = true;
    this.onConfirmAction.emit({success: true});
  }
}
