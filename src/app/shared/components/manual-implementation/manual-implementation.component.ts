import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { InfoHelperComponent } from '@cpdm-component/general-compliance/revenue-recognition/shared/info-helper/info-helper.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-manual-implementation',
    templateUrl: './manual-implementation.component.html',
    styleUrls: ['./manual-implementation.component.scss']
})
export class ManualImplementationComponent implements OnInit {
    @Input() templates;
    @Input() enableAdditionalFields: boolean;
    @Input() isTaskComplete: boolean;

    @Output() downloadTemplate = new EventEmitter();
    @Output() taskComplete = new EventEmitter();

    selectedTemplate = '';
    selectedLanguage = 'java';
    infoHelperData: any;

    constructor(private dialog: MatDialog) { }

    ngOnInit() {
    }

    onDownload() {
        const emitObj = { selectedTemplate: this.selectedTemplate };
        if (this.enableAdditionalFields) {
            emitObj["selectedLanguage"] = this.selectedLanguage;
        }
        this.downloadTemplate.emit(emitObj);
    }

    onComplete(event) {
        this.taskComplete.emit(event);
    }


    showInfoModal(event): void {
        event.name = `${event.name}`;
        this.infoHelperData = event;
        this.openDialog();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(InfoHelperComponent, {
            width: '30vw', height: 'auto',
            data: { complianceName: 'Smart Licensing', stepName: this.infoHelperData.name }
        });
    }
}
