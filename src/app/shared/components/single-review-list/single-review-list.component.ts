import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';



@Component({
  selector: 'app-single-review-list',
  templateUrl: './single-review-list.component.html',
  styleUrls: ['./single-review-list.component.scss']
})
export class SingleReviewListComponent implements OnInit {
  @Input() reviews: any;
  @Input() status: any;
  @Input() workFlow: any;
  @Output() reSubmit: EventEmitter<any> = new EventEmitter();
  role = Role;
  currentUserRole: string;
  currentUserCecId: string;
  scrollEnd = false;
  disableReSubmit = false;
  constructor(private userDetailsService: UserDetailsService) { }

  ngOnInit() {
    this.currentUserRole = this.userDetailsService.userRole;
    this.currentUserCecId = this.userDetailsService.getLoggedInCecId();
  }

  onScroll(event: any) {
    // visible height + pixel scrolled >= total height
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.scrollEnd = true;
    } else {
      this.scrollEnd = false;
    }
  }

  resubmitEnggRespForm() {
    this.disableReSubmit = true;
    this.reSubmit.emit();
  }
}
