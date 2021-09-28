import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-epic-error',
    templateUrl: './epic-error.component.html',
    styleUrls: ['./epic-error.component.scss']
})
export class EpicErrorComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<EpicErrorComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { errorMsg: string }) { }

    ngOnInit() {
    }

    onCancel(): void {
        this.dialogRef.close({success: false});
    }

}
