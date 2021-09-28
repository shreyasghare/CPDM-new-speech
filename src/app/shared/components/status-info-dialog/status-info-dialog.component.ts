import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-status-info-dialog',
  templateUrl: './status-info-dialog.component.html',
  styleUrls: ['./status-info-dialog.component.scss']
})
export class StatusInfoDialogComponent {
  columns = ['Supporting Features or Status', 'Description'];
  rows = [{
    title: 'Supports',
    description: 'Use this language when you determine the product fully meets the intent of the criteria or meets with equivalent facilitation. If the product meets equivalent facilitation, please document it in the "Remarks and Explanations" column.'
  }, {
    title: 'Partially Supports',
    description: 'Use this language when you determine the product does not fully meet the intent of the criteria, but provides some level of access relative to the criteria. Please document the exception in the "Remarks and Explanations" column.'
  }, {
    title: 'Does not Support',
    description: 'Use this language when you determine the product does not meet the intent of the criteria. Please document the reason in the "Remarks and Explanations" column.'
  }, {
    title: 'Not Applicable',
    description: 'Use this language when you determine that the criteria do not apply to the specific product. For example, many web applications do not have video content the "Not Applicable" can be used. Please state, "The application does not have any video content" in the "Remarks and Explanations" column.'
  }, {
    title: 'Not Evaluated',
    description: 'Use this language when the product has not been evaluated.'
  }];

  constructor(public dialogRef: MatDialogRef<StatusInfoDialogComponent>) { }

  onClose() {
    this.dialogRef.close({ success: false });
  }

}
