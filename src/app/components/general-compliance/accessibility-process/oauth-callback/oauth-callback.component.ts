import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {
  oauthData: any = {};
  message = 'Now you are connected to JIRA';
  chooseP = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private accessibilityService: AccessibilityProcessService) {

    activatedRoute.queryParams.subscribe(data => {

       if (activatedRoute.snapshot.url[0].path == 'rally') {
        this.message = 'Now you are connected to RALLY';
        this.oauthData.code = data.code;
        this.oauthData.state = data.state;
        this.accessibilityService.postRallyTokenData(this.oauthData).subscribe(res => {
        });
       } else {
              this.oauthData.oauthVerifier = data.oauth_verifier;
              this.oauthData.jiraUrl = data.serverURL;
              this.accessibilityService.postTokenData(this.oauthData).subscribe(res => {
            });
       }
     });
  }

  ngOnInit() { }

  ngOnDestroy() { }

}
