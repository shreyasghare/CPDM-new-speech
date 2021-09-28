import { Component, OnInit, Input } from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Role } from '@cpdm-model/role';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: any;
  role = Role;
  currentUserRole: string;
  currentUserCecId: string;
  scrollEnd = false;
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

}
