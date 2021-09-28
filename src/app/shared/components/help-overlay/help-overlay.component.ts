import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { HelpOverlayModel } from '@cpdm-shared/models/help-overlay.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'help-overlay',
  templateUrl: './help-overlay.component.html',
  styleUrls: ['./help-overlay.component.scss']
})
export class HelpOverlayComponent implements OnInit {
  isData: boolean;
  modalTabs: HelpOverlayModel[];
  public tabIndex = 0;
  public inline = false;
  public bordered = false;
  public tall = false;
  public vertical = false;
  public alignment: 'left' | 'right' | 'center';
  projectDetailServiceSubscription: Subscription;

  constructor(private projectsDetailService: ProjectsDetailService, public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any, private toastService: ToastService) { }

  ngOnInit() {
    const { name } = this.data.complianceData;
    this.projectDetailServiceSubscription = this.projectsDetailService.getGeneralComplianceHelpOverlay(name).subscribe(res => {
      this.isData = true;
      this.modalTabs = res;
    }, (error) => {
      this.isData = false;
      this.toastService.show('Error', 'Please try again.', 'danger', { autoHide: true, showAnimation: true });
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy() {
    if (this.projectDetailServiceSubscription) { this.projectDetailServiceSubscription.unsubscribe(); }
  }
}
