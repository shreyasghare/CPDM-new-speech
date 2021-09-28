import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs';
import { User } from '@cpdm-model/user.model';
import { VoiceRecognitionService } from '@cpdm-service/voice-recognition.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class NavbarComponent implements OnInit, OnDestroy {

  userDetails = new BehaviorSubject<User>(null);
  dropDownActive: boolean = false;
  selectedRole: { "value": string, "name"?: string };
  subscription: Subscription;

  constructor(
    public userDetailsSerivce: UserDetailsService,
    private voiceRecService :VoiceRecognitionService,
    private router: Router
  ) { }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    // Subscribe to login to get logged in user details
    this.subscription = this.userDetailsSerivce.currentUser.subscribe(data => {
      if (null != data) {
        if (data.hasAccessTo != undefined) {
          this.selectedRole = data.hasAccessTo.find(element => element.value == data.role);//role details
        }
        this.userDetails.next(data);
      }
    }
    )
  }

  toggleDropDown() {
    this.dropDownActive = !this.dropDownActive;
  }

  onDocumentClick(event) {
    if (!event.target.matches('.select')) {
      this.dropDownActive = false;
    }
  }


  switchRole(event: any) {
    if (event.target.id !== this.selectedRole.value) {
      //Switch role only if role is changed from existing role
      this.selectedRole.value = event.target.id;
      this.userDetailsSerivce.login(this.userDetailsSerivce.currentUserValue.cecId, this.selectedRole.value).subscribe(resData => {
        this.router.navigate(['']);
      });

    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
