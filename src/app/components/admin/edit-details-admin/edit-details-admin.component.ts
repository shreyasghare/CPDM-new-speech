import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { MultilevelStepsSideBarModel } from '@cpdm-model/admin/multilevelStepsSideBar.model';
import { EditDetailsAdminService } from '@cpdm-service/admin/edit-details-admin.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ImageContentEditComponent } from './image-content-edit/image-content-edit.component';

@Component({
  selector: 'app-edit-details-admin',
  templateUrl: './edit-details-admin.component.html',
  styleUrls: ['./edit-details-admin.component.scss']

})
export class EditDetailsAdminComponent implements OnInit, OnDestroy {

  editModalsInfoIconsServiceSubscription: Subscription;
  multilevelSteps: MultilevelStepsSideBarModel;
  menuSubmenuSelected: {};

  @ViewChild(ImageContentEditComponent, {static: false}) imgContent: ImageContentEditComponent;
  dataLostErrordialogRef: MatDialogRef<any>;
  isEditorContentChanged: boolean;
  enableRoute: boolean;
  
  constructor(private editDetailsAdminService: EditDetailsAdminService,
              private toastService: ToastService) { }

  ngOnInit() {
    this.editModalsInfoIconsServiceSubscription = this.editDetailsAdminService.getStackableSidebarData().subscribe((res) => {
      const { success, data } = res;
      if (success) {
        this.multilevelSteps = res;
      } else {
        this.toastService.show('Error in data fetching', 'Error in fetching sidebar data', 'danger');
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in fetching sidebar data', 'danger');
    });
  }

  menuChanged(event: any) {
    this.menuSubmenuSelected = event;
    this.editDetailsAdminService.updateAdminEditData(this.menuSubmenuSelected);
  }

  onEditorContentChange(event: boolean): void {
    this.isEditorContentChanged = event;
  }

  onHomeLink(): void {
    this.imgContent.onDiscard(true);
  }

  ngOnDestroy() {
    if (this.editModalsInfoIconsServiceSubscription != null) {
      this.editModalsInfoIconsServiceSubscription.unsubscribe();
    }
  }

}
