import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';

@Component({
  selector: 'custom-dropzone',
  templateUrl: './custom-dropzone.component.html',
  styleUrls: ['./custom-dropzone.component.scss']
})
export class CustomDropzoneComponent implements OnInit {

  @ViewChild('fileInput', null) fileInput: any;
  @Output() onUploadClicked = new EventEmitter<any>();
  @Output() isFileSelected = new EventEmitter<any>();
  @Output() isFileRemoved = new EventEmitter<any>();
  @Input() componentState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };
  @Input() docCentralObj = {
    fileName: '',
    edcsID: '',
    nodeRef: ''
  };
  disableDownloadBtn = false;

  files: any = [];

  constructor(private docCentralService: DocCentralService) { }

  ngOnInit() {}


  uploadFile(event) {
    //   for (let index = 0; index < event.length; index++) {
    //     const element = event[index];
    //     this.files.push(element);
    // }

    this.files = [];
    const element = event[0];
    this.files.push(element);
    
    this.componentState.isFileUploded = false;
    if(this.files.length) this.isFileSelected.emit(true);
    // this.setComponentStateWhileSelecting.emit(false);
}

  /**
   *
   * @param event User event
   */
  deleteAttachment(event) {
    // this.componentState.showUploadContainer = false;
    // this.componentState.isFileUploded = false;

    event.stopPropagation();
    this.files.splice(0, 1);

    // this.setComponentStateWhileRemoving.emit(this.componentState);

    // this.componentState.showUploadContainer = true;
    // this.componentState.isFileUploded = true;
    this.fileInput.nativeElement.value = '';
    if (this.docCentralObj && this.docCentralObj.edcsID) {
      this.componentState.isFileUploded = true;
    }
    this.isFileRemoved.emit(true);
  }

  onUpload(event) {
    event.stopPropagation();
    this.fileInput.nativeElement.value = '';
    this.onUploadClicked.emit(this.files);
  }

  async onDownload() {
    if (this.docCentralObj.nodeRef != null) {
      this.disableDownloadBtn = true;
      try {
        await this.docCentralService.downloadFileFromDocCentral(this.docCentralObj.nodeRef, this.docCentralObj.fileName);
        this.disableDownloadBtn = false;
      } catch (error) {

      }
    }
  }
}
