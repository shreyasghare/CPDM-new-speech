import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessProcessRootComponent } from './access-process-root/access-process-root.component';
import { OauthCallbackComponent } from './oauth-callback/oauth-callback.component';

const accessibilityRoutes: Routes = [
    { path: 'jira/authentication', component: OauthCallbackComponent },
    { path: 'rally/authentication', component: OauthCallbackComponent },
    { path: ':id', component: AccessProcessRootComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(accessibilityRoutes)
    ]
})

export class AccessibilityRoutingModule {}
