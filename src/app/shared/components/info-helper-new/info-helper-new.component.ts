import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-info-helper-new',
  templateUrl: './info-helper-new.component.html',
  styleUrls: ['./info-helper-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InfoHelperNewComponent implements OnInit, OnDestroy {
  header: string;
  description: string;
  infoHelperSubscription: Subscription;
  isDataReady = false;

  constructor(private dataService: ProjectsDataService,
              public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public inputData: any ) { }

  ngOnInit() {
    const { workflowName, stepName, title } = this.inputData; 
    this.infoHelperSubscription = this.dataService.getInfoHelper(workflowName, stepName, title).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.isDataReady = true;
        const { title, desc, uiTitle  } = data;
        this.header = uiTitle && uiTitle !== '' ? uiTitle : title;
        this.description = desc;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  // To unsubscribe all the custom subscriptions
  ngOnDestroy(): void {
    if (this.infoHelperSubscription != null) {
      this.infoHelperSubscription.unsubscribe();
    }
  }
}
