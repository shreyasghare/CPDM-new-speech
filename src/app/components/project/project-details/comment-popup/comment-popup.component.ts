import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-comment-popup',
  templateUrl: './comment-popup.component.html',
  styleUrls: ['./comment-popup.component.scss']
})
export class CommentPopupComponent implements OnInit {
  projectId: String;
  complianceName: String;
  userComment: [];
  complianceType: string;
  logginUser: string;
  onClose: any;
  projectCommentUpdate: any;
  complianceItemId: String;
  commentForm: any;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CommentPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private projectsDetailService: ProjectsDetailService,
    private userService: UserDetailsService) { }

    ngOnInit() {
      this.commentForm = this.formBuilder.group({
        comment: ['', [Validators.required, Validators.minLength(3)]]
        // comment: ['', Validators.required]
      });
      // Object Destructuring
      const {complianceName, userComment, projectId, complianceType, complianceItemId} = this.data;
      this.complianceName = complianceName;
      this.userComment = userComment;
      this.projectId = projectId;
      this.complianceType = complianceType;
      this.complianceItemId = complianceItemId;

      try {
      let commentIndex;
      if (this.userComment.length > 0) {
        commentIndex = this.userComment.length - 1;
        this.commentForm.patchValue({
          comment: this.userComment[commentIndex]['comment']
        });
      } else {
        this.commentForm.patchValue({
          comment: ''
        });
      }
    } catch (err) {
      this.commentForm.patchValue({
        comment: ''
      });
    }
  }

  ngAfterViewInit() {
    this.logginUser = this.userService.getLoggedInCecId();
    const obj = {
      projectId: this.projectId,
      complianceItemName: this.complianceName,
      complianceType: this.complianceType,
      complianceItemId: this.complianceItemId
    };
    this.projectsDetailService.readComments(obj).subscribe(data => {
      this.projectsDetailService.setProjectDetails(data);
    }, err => {

    });
  }

  get f() { return this.commentForm.controls; }

  onSubmit() {
    this.submitted = true;

    const obj = {
      projectId: this.projectId,
      complianceItemName: this.complianceName,
      comment: this.commentForm.value.comment,
      complianceType: this.complianceType,
      userId: this.logginUser,
      complianceItemId: this.complianceItemId,
    };

    this.projectsDetailService.updateComplianceItemComment(obj).subscribe(
      data => {
        this.projectsDetailService.setProjectDetails(data);
        this.dialogRef.close(data);
      },
      err => {
        console.error(err);
      }
    );
  }

  commentPopUpClose() {
    this.dialogRef.close();
  }
}
