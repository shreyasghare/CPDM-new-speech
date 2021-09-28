import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { ToastService } from '@cpdm-service/shared/toast.service';

@Component({
  selector: 'app-adr-comment',
  templateUrl: './adr-comment.component.html',
  styleUrls: ['./adr-comment.component.scss']
})
export class AdrCommentComponent implements OnInit, AfterViewInit {
  objectDtls: any;
  status: string;
  adrStatus: string;
  commentForm: FormGroup;

  userComment = '';

  submitted = false;
  onClose: any;
  savedAccessibilityObj: any;
  applicable: any;
  adrApprovalSubmitPMViewList = false;
  constructor(
    public bsModalRef: BsModalRef,
    private accessibilityProcessService: AccessibilityProcessService,
    private userDetailsService: UserDetailsService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,) { }

  ngOnInit() {
    // this.accessibilityProcessService.getAccessibilityStatus().subscribe(res => {
    //   this.adrStatus = res;
    // });
    this.commentForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(0)]]
    });
  }

  ngAfterViewInit() {
    // Pre-populating the comments
    if (this.objectDtls.adrItem.comments && this.objectDtls.adrItem.comments.length > 0) {
      this.objectDtls.adrItem.comments.forEach(commentRecord => {
        this.userComment = commentRecord.comment + '\n' + this.userComment;
      });

      this.commentForm.patchValue({
        comment: this.userComment
        // comment:this.objectDtls.adrItem.comments[this.objectDtls.adrItem.comments.length-1]
      });
    }


    if (this.objectDtls.adrApprovalSubmitPMViewList) {
      this.adrApprovalSubmitPMViewList = this.objectDtls.adrApprovalSubmitPMViewList;
    }
    const readCommentObj = {
        projectId: this.objectDtls.projectId,
        adrType: this.objectDtls.adrType,
        adrId: this.objectDtls.adrItem.refId
      };
    if (this.objectDtls.adrItem && this.objectDtls.adrItem.applicable) {
      this.applicable = this.objectDtls.adrItem.applicable;
    }

    if (this.objectDtls.adrItem && this.objectDtls.adrItem.status) {
      this.status = this.objectDtls.adrItem.status;
    }
    this.accessibilityProcessService.getCommentsForAdr(readCommentObj).subscribe(
      res => {
        try {
          if (res) {
            this.savedAccessibilityObj = res;
            this.patchCommentOnApplicable();
          }
        } catch (err) {
          this.commentForm.value.comment = '';
        }
      }
    );
  }

  patchCommentOnApplicable() {
    if (this.savedAccessibilityObj) {
      const i = this.findWithAttr(this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType], 'name', this.objectDtls.adrItem.name );
      const commentIndex = this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType][i].comments.length - 1;

      // Changed for US6701 - see all functionality.
      this.userComment =
      this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType][i].comments[commentIndex].comment ?
      this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType][i].comments[commentIndex].comment : '';

      this.commentForm.patchValue({
        comment: this.userComment
      });
    } else {
      this.commentForm.patchValue({
        comment: undefined
      });
    }
  }

  get f() { return this.commentForm.controls; }

  onChangeCheckbox() {
    this.applicable = !this.applicable;
    if (!this.applicable) {
      this.commentForm.patchValue({
        comment: ''
      });
      this.commentForm.controls.comment.disable();
    } else {
      this.patchCommentOnApplicable();
      this.commentForm.controls.comment.enable();
    }
  }

  onSubmit() {
    this.submitted = true;

    const obj = {
      projectId: this.objectDtls.projectId,
      adrType: this.objectDtls.adrType,
      refId: this.objectDtls.adrItem.refId,
      name: this.objectDtls.adrItem.name,
      description: this.objectDtls.adrItem.description,
      applicable: this.applicable,
      status: this.status,
      criteria: this.objectDtls.adrItem.criteria,
      section: this.objectDtls.adrItem.section,
      comments: {
        comment: this.commentForm.value.comment,
        timestamp: new Date(),
        userId: this.userDetailsService.getLoggedInCecId()
      }
    };

    this.accessibilityProcessService.sendAdrComment(this.objectDtls.projectId, obj).subscribe(
      data => {

        if (this.objectDtls.state === 'adrApprove' && this.objectDtls.isPmScreen) {
          let adrTypeArray = [...data.adrDetails[this.objectDtls.adrType]];
          adrTypeArray = adrTypeArray.filter((row) => {
            return row.refId === this.objectDtls.adrItem.refId;
          });
          data.adrDetails[this.objectDtls.adrType] = adrTypeArray;
          this.onClose(data);
        } else {
          this.onClose(data);
        }
      },
      err => {
       
        /*
        Fix for DE2781,DE2804 Commented -  33K
        if(err.error.error === 'request entity too large'){
          this.toastService.show('Error in saving comment', 'The comment entered is too long. Please reduce the size of the comment', 'danger');
        } */
      }
    );
  }

  commentPopUpClose() {
    if (this.savedAccessibilityObj) {
      const index =
      this.findWithAttr(this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType], 'refId', this.objectDtls.adrItem.refId);
      this.savedAccessibilityObj.adrDetails[this.objectDtls.adrType][index].applicable = this.objectDtls.adrItem.applicable;
    }
    if (this.savedAccessibilityObj !== undefined && this.objectDtls.isPmScreen && this.objectDtls.state === 'adrApprove') {
      this.onClose(undefined);
    } else  {
      this.onClose(this.savedAccessibilityObj);
    }
  }

  onSelectStatusType() {

   }

  findWithAttr(array, attr, value) {
    for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
  }

}
