import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { validateFile } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-import-adr-checklist-dialog',
  templateUrl: './import-adr-checklist-dialog.component.html',
  styleUrls: ['./import-adr-checklist-dialog.component.scss']
})
export class ImportAdrChecklistDialogComponent implements OnInit {
  file: File;

  constructor(
    public dialogRef: MatDialogRef<ImportAdrChecklistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {downloadPath: string, name: string},
    private utils: UtilsService,
    private toast: ToastService) { }

  ngOnInit() {
  }

  onFilePicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    const isFileValid = validateFile(file, 'xlsx');

    if (isFileValid && file) {
      this.file = file;
    } else {
      this.toast.show('Import Failed', 'Please choose a valid Excel file', 'danger');
    }
  }

  async onDownload(): Promise<any> {
    await this.utils.downloadFileFromNode(this.data.downloadPath, this.data.name);
  }

  onImport() {
     this.dialogRef.close(this.file);
  }

}
