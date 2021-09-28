import { UserDetailsService } from './../../../../services/auth/user-details.service';
import { Component, OnInit } from '@angular/core';
import { Role } from '@cpdm-model/role';

@Component({
  selector: 'app-gz-complete',
  templateUrl: './gz-complete.component.html',
  styleUrls: ['./gz-complete.component.scss']
})
export class GzCompleteComponent implements OnInit {

  role = Role;
  currentRole: string;
  gzStatus = {
    completed: {
      icon: 'complete',
      status: 'The Globalization process is complete.',
      message: ''
    }
  }

  constructor(private userDetailsService: UserDetailsService) { }

  ngOnInit() {
    this.currentRole = this.userDetailsService.userRole;
    this.gzStatus.completed.message = this.currentRole == this.role.pm ?
    `Thank you for working with the GTS team.<br/>For any further help, email: <a href="mailto: globalgts-eng-mgrs@cisco.com"> globalgts-eng-mgrs@cisco.com</a>` :
    `Thank you for working with the Engineering team.<br/>For any further help, please contact : <a href="mailto: globalgts-eng-mgrs@cisco.com"> globalgts-eng-mgrs@cisco.com</a>`
  }

}
