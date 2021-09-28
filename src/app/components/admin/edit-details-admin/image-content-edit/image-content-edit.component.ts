import { Component, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import FroalaEditor from 'froala-editor';

import * as $ from 'jquery'; window['$'] = $; window['jQuery'] = $;
import 'froala-editor/js/froala_editor.pkgd.min.js';
import { EditDetailsAdminService } from '@cpdm-service/admin/edit-details-admin.service';
import { Subscription } from 'rxjs';
import { ImageContentDataModel } from '@cpdm-model/admin/imageContentData.model';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ReccomendationEditTableComponent } from './reccomendation-edit-table/reccomendation-edit-table.component';

@Component({
  selector: 'image-content-edit',
  templateUrl: './image-content-edit.component.html',
  styleUrls: ['./image-content-edit.component.scss']
})
export class ImageContentEditComponent implements OnInit, OnDestroy {
  isEditMode = false;
  imageContentData: ImageContentDataModel[];
  imageContentRowSelected: string;
  editAdminDetailsSubscription: Subscription;
  clickedImage: string;
  dialogRef: MatDialogRef<any>;
  dataLostErrordialogRef: MatDialogRef<any>;
  publishDialogRef: MatDialogRef<any>;
  isStepWithoutHelperData: boolean;
  stepName: string;
  folderPath: string;
  enableSaveAndDiscard = false;
  originalText: string;
  desc: string;
  modalName: string;
  isDiscarded = false;
  dataLostErrSubscription: Subscription;
  updateServiceSubscription: Subscription;
  adminEditSubjectSubscription: Subscription;
  title: string;
  workflow: string;
  menuSubmenuSelected: {
    menu: { title: string, name: string },
    subMenu: { title: string, name: string, module: string, modalSize?: string, path?: string }
  };
  allowedWorkflows = ['projectDashboard', 'accessibility', 'revenueRecognition', 'smartLicensing',
    'apiProducts', 'serviceability', 'ipV6', 'telemetry', 'csdl', 'tpsd', 'export-compliance', 'communications-regulatory'];
  isPreviewData = false;
  isDraftVersionAvailable = false;
  versionDropdownVal: string;
  version: string;

  // @Input() menuSubmenuSelected: {
  //   menu: { title: string, name: string },
  //   subMenu: { title: string, name: string, modalSize?: string, path?: string }
  // };
  @ViewChild('imageDialog', { static: false }) imageDialog: TemplateRef<MatDialog>;
  @ViewChild('dataLostErrorDialog', { static: false }) dataLostErrorDialog: TemplateRef<MatDialog>;
  @Output() isEditorContentChanged = new EventEmitter();
  @ViewChild('publishDialog', { static: false }) publishDialog: TemplateRef<MatDialog>;
  getRecommendationSubscription: Subscription;
  publishSubscription: Subscription;

  constructor(private editAdminDetailsService: EditDetailsAdminService,
    public dialog: MatDialog,
    private toastService: ToastService,
    public router: Router) { }

  public options: Object = {
    enter: FroalaEditor.ENTER_BR,
    events: {
      'froalaEditor.contentChanged': (e, editor) => {
        this.originalText = editor._original_html;
        this.enableSaveAndDiscard = true;
      }
    },
    key: [`${environment.froalaKeyId}`, `${environment.froalaKey}`],
    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
      'fontFamily', 'fontSize', 'inlineStyle', 'clearFormatting', '|', 'alignLeft', 'alignCenter',
      'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat',
      'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote', 'insertLink', '|',
      'undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html']
  };

  ngOnInit() {
    this.stepName = '';
    this.imageContentData = [];
    this.adminEditSubjectSubscription = this.editAdminDetailsService.adminEditDataSub.subscribe(res => {
      if (res) {
        this.menuSubmenuSelected = res;
        this.stepName = '';
        this.imageContentData = [];
        if (this.enableSaveAndDiscard && this.imageContentData) {
          this.dataLostErrordialogRef = this.dialog.open(this.dataLostErrorDialog, { width: '35vw', height: 'auto', disableClose: true });
          this.dataLostErrordialogRef.afterClosed().subscribe(result => {
            if (result === 'discard') {
              this.enableSaveAndDiscard = false;
              this.loadImageContentData();
            } else {
              this.enableSaveAndDiscard = true;
            }
          });
        } else {
          this.loadImageContentData();
        }
      }
    });

  }

  // commented part - previous approach to get data from edit-modal component
  // ngOnChanges(changes: SimpleChanges): void {
  //   this.stepName = '';
  //   this.imageContentData = [];
  //   if (this.enableSaveAndDiscard && this.imageContentData) {
  //     this.dataLostErrordialogRef = this.dialog.open(this.dataLostErrorDialog, {width: '35vw', height: 'auto', disableClose: true });
  //     this.dataLostErrordialogRef.afterClosed().subscribe(result => {
  //       if (result === 'discard') {
  //         this.enableSaveAndDiscard = false;
  //         this.loadImageContentData();
  //       } else {
  //         this.enableSaveAndDiscard = true;
  //       }
  //     });
  //   } else {
  //     this.loadImageContentData();
  //   }
  // }

  async loadImageContentData() {
    this.imageContentRowSelected = '';
    if (this.menuSubmenuSelected) {
      this.isEditMode = false;
      const { menu, subMenu } = this.menuSubmenuSelected;
      const { title: workflowTitle, name: workflowName } = menu;
      const { title: subMenuTitle, name: submenuName, modalSize, module } = subMenu;
      this.modalName = submenuName;
      if (workflowName && this.allowedWorkflows.includes(workflowName) && submenuName) {
        this.workflow = workflowTitle;
        this.title = subMenuTitle;
        switch (module) {
          case 'overview':
            this.getOverviewData(workflowName, workflowTitle);
            break;
          case 'informationHelper':
            this.getInfoHelperData({ workflowName, submenuName, modalSize, subMenu });
            break;
          case 'recommendation':
            this.getInitialRecommendationData(workflowName, subMenuTitle);
        }
      } else { this.getStepName(subMenu); }
    }
  }

  private getStepName(subMenu): void {
    this.imageContentData = [];
    if (subMenu.title && subMenu.title.includes(':')) {
      const parts = subMenu.title.split(':');
      this.stepName = parts[parts.length - 1].trim();
    } else { this.stepName = subMenu.title; }
  }

  /**
   * When edit button is clicked to edit help-overlay content, info icon content or recommendation content.
   */
  editClicked(rowSelected: string, index: number) {
    if (this.menuSubmenuSelected.subMenu.module === 'recommendation') {
      this.isPreviewData = false;
      if (this.isDraftVersionAvailable) { this.getRecommendationPreviewData('draft'); }
      else { this.getRecommendationPreviewData('latest'); }
    } else {
      if (this.enableSaveAndDiscard && this.imageContentData.length > 1 && !this.isDiscarded) {
        this.dataLostErrordialogRef = this.dialog.open(this.dataLostErrorDialog, { width: '35vw', height: 'auto', disableClose: true });
        this.dataLostErrordialogRef.afterClosed().subscribe((result) => {
          if (this.imageContentData.length > 1 && result === 'discard') {
            this.isDiscarded = true;
            this.enableSaveAndDiscard = false;
          } else { this.enableSaveAndDiscard = true; }
        });
      } else {
        this.desc = this.imageContentData[index].desc;
        this.imageContentRowSelected = rowSelected.replace(' ', '-').toLowerCase();
        this.isEditMode = true;
      }
    }
    this.isDiscarded = false;
  }
  /**
   * When content is saved.
   */
  saveClicked(index: number) {
    if (this.desc.startsWith('<p>') && this.desc.endsWith('</p>')) {
      this.desc = this.desc.substring(3, this.desc.length - 4);
    }
    if (this.imageContentData) {
      const { _id, workflowTitle } = this.imageContentData[index];
      const updateBody = {
        id: _id,
        desc: btoa(this.desc),
        workflowtitle: workflowTitle
      };
      this.imageContentData[index].name === 'overview' ? this.imageContentData[index].name = 'overview'
        : this.imageContentData[index].name = 'informationHelper';
      this.updateServiceSubscription = this.editAdminDetailsService.updateModalContent(this.imageContentData[index].name, updateBody)
        .subscribe(res => {
          const { success, data } = res;
          if (success) {
            this.imageContentData[index].name = data.name;
            this.imageContentData[index].title = data.title;
            this.imageContentData[index].updatedOn = data.updatedOn;
            this.imageContentData[index].workflow = data.workflow;
            this.imageContentData[index].desc = data.desc;

            this.imageContentRowSelected = '';
            this.toastService.show('Data updated', 'Description updated successfully', 'success');
          } else {
            this.toastService.show('Update failed', 'Error while updating description', 'danger');
          }
          this.enableSaveAndDiscard = false;
          this.isEditMode = false;
        }, () => {
          this.toastService.show('Update failed', 'Error while updating description', 'danger');
        });
    }
  }
  /**
   * When preview is clicked
   */
  previewClicked(index: number) {
    if (this.imageContentData[index].name === 'overview') {
      const menu = { title: this.imageContentData[index].workflowTitle, name: this.imageContentData[index].workflow };
      const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
        autoFocus: false,
        height: '70vh',
        width: '70vw',
        data: { complianceData: menu }
      });
      helpOverlayModal.afterClosed().subscribe(result => {
      });
    } else {
      const infoHelper = this.dialog.open(InfoHelperNewComponent, {
        autoFocus: false,
        maxHeight: '96vh',
        width: this.imageContentData[index].modalSize && this.imageContentData[index].modalSize === 'large' ? '67vw' : '40vw',
        data: {
          workflowName: this.imageContentData[index].workflow, stepName: this.imageContentData[index].name,
          title: this.imageContentData[index].title, uiTitle: this.imageContentData[index].uiTitle
        }
      });
      infoHelper.afterClosed().subscribe(result => {
      });
    }
  }
  /**
   * When a thumbnail image is clicked to view enlarge image
   */
  imageClicked(clickedImage: string): void {
    this.clickedImage = clickedImage;
    this.dialogRef = this.dialog.open(this.imageDialog);
    this.dialogRef.afterClosed().subscribe();
  }

  // on click of "Discard" button
  async onDiscard(fromHomeLink?: boolean) {
    if (this.enableSaveAndDiscard) {
      this.dataLostErrordialogRef = this.dialog.open(this.dataLostErrorDialog, { width: '35vw', height: 'auto', disableClose: true });
      const result = await this.dataLostErrordialogRef.afterClosed().toPromise();
      if (fromHomeLink && result === 'discard') {
        this.router.navigate(['/home']);
      } else {
        result === 'discard' ? this.enableSaveAndDiscard = false : this.enableSaveAndDiscard = true;
      }
    } else {
      this.imageContentRowSelected = '';
      this.enableSaveAndDiscard = false;
      this.isEditMode = false;
      if (fromHomeLink) { this.router.navigate(['/home']); }
    }
  }

  // after clicking 'Yes' button in dataLostError popup
  saveChanges(): void {
    this.enableSaveAndDiscard = false;
    this.dataLostErrordialogRef.close();
  }

  // after clicking 'No' button in dataLostError popup
  discardChanges(): void {
    this.desc = this.originalText;
    this.imageContentRowSelected = '';
    this.isEditMode = false;
    this.enableSaveAndDiscard = false;
    this.dataLostErrordialogRef.close('discard');
  }

  onClose(dialogRef): void {
    dialogRef.close();
  }

  /**
   * To get Overview data
   */
  private async getOverviewData(workflowName, workflowTitle) {
    const res = await this.editAdminDetailsService.getImageContentDataForOverview(workflowName, workflowTitle).toPromise();
    if (res) {
      const { success, data, metaData: { path } } = res;
      if (success) {
        this.folderPath = path;
        const updatedData = data.filter(imgObj => {
          if (imgObj.originalImage) { imgObj.originalImage = imgObj.originalImage.replace(/\//g, '-'); }
          if (imgObj.thumbnailImage) { imgObj.thumbnailImage = imgObj.thumbnailImage.replace(/\//g, '-'); }
          return imgObj;
        });
        this.imageContentData = updatedData;
      } else {
        this.toastService.show('Error in data fetching', 'Error in fetching overview data', 'danger');
      }
    } else {
      this.toastService.show('Error in data fetching', 'Error in fetching overview data', 'danger');
    }
  }

  /**
   * To get InformationHelper data
   */
  private async getInfoHelperData(menuData) {
    const { workflowName, submenuName, modalSize, subMenu } = menuData;
    const res = await this.editAdminDetailsService.getImageContentDataForInfoHelper(workflowName, submenuName, modalSize)
      .toPromise();
    if (res) {
      const { success, data, metaData: { path } } = res;
      if (success) {
        this.folderPath = path;
        this.imageContentData = data;
        if (data.length) {
          // this.desc = this.imageContentData[0].desc;
        } else {
          this.getStepName(subMenu);
        }
      } else {
        this.toastService.show('Error in data fetching', 'Error in fetching info helper data', 'danger');
      }
    } else {
      this.toastService.show('Error in data fetching', 'Error in fetching info helper data', 'danger');
    }
  }
  /**
    * To get recommendations data for TBPs
    */
  private getInitialRecommendationData(workflowName, subMenuTitle) {
    this.getRecommendationSubscription = this.editAdminDetailsService.getImageContentDataForRecommendation(workflowName, subMenuTitle).subscribe(res => {
      if (res) {
        const { success, data, metaData: { path } } = res;
        if (success) {
          this.folderPath = path;
          this.imageContentData = data;
          if (this.imageContentData.length == 1) {
            this.isDraftVersionAvailable = this.imageContentData[0].hasDraft;
            this.versionDropdownVal = this.imageContentData[0].version.name;
          }
        } else {
          this.toastService.show('Error in data fetching', 'Error in fetching info helper data', 'danger');
        }
      } else {
        this.toastService.show('Error in data fetching', 'Error in fetching info helper data', 'danger');
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in fetching info helper data', 'danger');
    });
  }
  /**
   * To display live production preview for recommendations
   */
  liveProdPreviewClicked() {
    this.isPreviewData = true;
    this.getRecommendationPreviewData('latest');
  }
  /**
   * To display draft preview for recommendations
   */
  draftStatePreviewClicked() {
    this.isPreviewData = true;
    this.getRecommendationPreviewData('draft')
  }
  /**
   * Get production & draft Recommendations Data
   * @param version 
   */
  private getRecommendationPreviewData(version) {
    const config = {
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      data: { version: version, isReadOnly: this.isPreviewData },
      disableClose: true,
    };
    const dialogRef = this.dialog.open(ReccomendationEditTableComponent, config)
    dialogRef.afterClosed().subscribe(async (isDraftReady) => { if (isDraftReady) { this.isDraftVersionAvailable = isDraftReady; } })
    this.isPreviewData = false;
  }
  /**
   * enable dialog and publish the draft version
   */
  openPublishAsDialog() {
    this.publishDialogRef = this.dialog.open(this.publishDialog, { width: '24vw', disableClose: true })
  }
  /**
   * Publish the drafted data
   */
  publishChanges() {
    const version = { "version": this.version }
    this.publishSubscription = this.editAdminDetailsService.publishDraftedData(version)
      .subscribe(res => {
        const { success } = res;
        if (success) {
          this.toastService.show('Changes published', `The updated ${this.title} data (${this.version}) is now live.`, 'success');
          this.publishDialogRef.close();
          this.isDraftVersionAvailable = false;
          this.versionDropdownVal = this.version;
        } else { this.toastService.show('Error in publishing', 'Error while publishing draft', 'danger'); }
      }, () => {
        this.toastService.show('Error', 'Error while publishing draft', 'danger');
      })
  }
  /**
   * To unsubscribe all custom subscriptions
   */
  ngOnDestroy(): void {
    if (this.updateServiceSubscription != null) {
      this.updateServiceSubscription.unsubscribe();
    }
    if (this.dataLostErrSubscription != null) {
      this.dataLostErrSubscription.unsubscribe();
    }
    if (this.adminEditSubjectSubscription != null) {
      this.adminEditSubjectSubscription.unsubscribe();
    }
    if (this.getRecommendationSubscription != null) {
      this.getRecommendationSubscription.unsubscribe();
    }
    if (this.publishSubscription != null) {
      this.publishSubscription.unsubscribe();
    }
  }
}
