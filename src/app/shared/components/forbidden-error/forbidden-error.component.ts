import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-forbidden-error',
  templateUrl: './forbidden-error.component.html',
  styleUrls: ['./forbidden-error.component.scss']
})
export class ForbiddenErrorComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<ForbiddenErrorComponent>) { }

    ngOnInit() {
    }

    onCancel(): void {
        this.dialogRef.close({success: false});
    }

}
