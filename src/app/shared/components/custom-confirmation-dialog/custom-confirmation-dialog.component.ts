import { Component, OnInit, Inject, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-custom-confirmation-dialog',
  templateUrl: './custom-confirmation-dialog.component.html',
  styleUrls: ['./custom-confirmation-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomConfirmationDialogComponent implements OnInit {
  showLoader = false;
  onConfirmAction = new EventEmitter();
  headerText: string;
  confirmationText: string;
  buttonText: string;
  buttonStyle: string;
  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: {headerText: string, confirmationText: string, buttonText: string, buttonStyle: string}) { }

  ngOnInit() {
    this.headerText = this.data.headerText ? this.data.headerText : 'Confirm';
    this.confirmationText = this.data.confirmationText;
    this.buttonText = this.data.buttonText? this.data.buttonText : 'Confirm';
    if(this.data.buttonStyle){
      this.buttonStyle = this.data.buttonStyle
    }
  }

  closeModal(): void {
    this.dialogRef.close({success: false});
  }

  onConfirm(): void {
    this.showLoader = true;
    this.onConfirmAction.emit({success: true});
  }

}

