import { Component, OnInit } from '@angular/core';
import { MatDialogRef} from '@angular/material';
@Component({
  selector: 'app-submit-conformation',
  templateUrl: './submit-conformation.component.html',
  styleUrls: ['./submit-conformation.component.scss']
})
export class SubmitConformationComponent implements OnInit {

  showLoader = false;

  constructor(public dialogRef: MatDialogRef<any>) { }

  ngOnInit() {
  }

  onCancel(event?: any) {
    event ? this.dialogRef.close(event) : this.dialogRef.close();
  }

  onConfirm() {
    this.onCancel('finished');
  }
}
