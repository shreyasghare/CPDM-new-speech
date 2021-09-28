import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-feature-error',
    templateUrl: './feature-error.component.html',
    styleUrls: ['./feature-error.component.scss']
})
export class FeatureErrorComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<FeatureErrorComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { errorMsg: string }) { }

    ngOnInit() {
    }

    onCancel(): void {
        this.dialogRef.close({success: false});
    }
}
