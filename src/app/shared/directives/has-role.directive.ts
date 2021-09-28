import { Directive, OnInit, Input, ViewContainerRef, TemplateRef } from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';


@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  // the role the user must have
  @Input() appHasRole: Array<string>;

  isVisible = false;

  userRole;

  /**
   * @param {ViewContainerRef} viewContainerRef
   * 	-- the location where we need to render the templateRef
   * @param {TemplateRef<any>} templateRef
   *   -- the templateRef to be potentially rendered
   * @param {UserDetailsService} userDetailsService
   *   -- will give us access to the role a user has
   */
  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private userDetailsService: UserDetailsService
  ) {}

  ngOnInit() {
    //  We call to the getUserRole to know the role the user has
    this.userRole = this.userDetailsService.userRole;

    // If he doesn't have any role, we clear the viewContainerRef
    if (!this.userRole) {
      this.viewContainerRef.clear();
    }

    // If the user has the role needed to
    // render this component we can add it
    if (this.appHasRole.includes(this.userRole)) {
      // If it is already visible (which can happen if
      // his role changed) we do not need to add it a second time
      if (!this.isVisible) {
        // We update the `isVisible` property and add the
        // templateRef to the view using the
        // 'createEmbeddedView' method of the viewContainerRef
        this.isVisible = true;
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    } else {
      // If the user does not have the role,
      // we update the `isVisible` property and clear
      // the contents of the viewContainerRef
      this.isVisible = false;
      this.viewContainerRef.clear();
    }
  }
}
