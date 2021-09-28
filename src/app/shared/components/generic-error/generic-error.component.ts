import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-generic-error',
    templateUrl: './generic-error.component.html',
    styleUrls: ['./generic-error.component.scss']
})
export class GenericErrorComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<GenericErrorComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { errorMsg: string }) { }

    ngOnInit() {
    }

    onCancel(): void {
        this.dialogRef.close({success: false});
    }
}
