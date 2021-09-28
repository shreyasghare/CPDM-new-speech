import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { CreateProjectFormComponent } from '../create-project/create-project-form/create-project-form.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit, AfterViewInit, OnDestroy {

  createProjectPage = true;
  compliancePage = false;
  isFormValid: boolean ;
  bubbleNavigation = true;
  standardTemplate: Subscription;

  constructor(private router: Router, private dataService: ProjectsDataService) { }

  @ViewChild(CreateProjectFormComponent, {static: false}) child: CreateProjectFormComponent;

  // Navigation Bubble click events
  goToNextPage() {
    if (this.isFormValid) {
      this.createProjectPage = false;
      this.compliancePage = true;
    }
    this.child.onSaveNext();
  }

  // Navigation Bubble click events
  goToPreviousPage(): void {
    this.createProjectPage = true;
    this.compliancePage = false;
    this.child.gotoBack();
  }

  // go to homepage calling edit form method from parent
  goToHome() {
    this.child.gotoHome();
  }

  // Angular lifecycle hook to initialize/get the edit form component reactive form state
  ngAfterViewInit() {
    this.child.createProForm.statusChanges.subscribe(res => {
     res.toLowerCase() == 'valid' ? this.isFormValid = true : this.isFormValid = false;
    });
  }

  screenUpdateEvent(event: string): void {
    if (event === 'compliance') {
      this.createProjectPage = false;
      this.compliancePage = true;
    } else if (event === 'createProject') {
      this.createProjectPage = true;
      this.compliancePage = false;
    } else if (event === 'wizardShow') {
      this.bubbleNavigation = false;
    } else if (event === 'wizardHide') {
      this.bubbleNavigation = true;

    }
  }

  ngOnInit() {
      this.standardTemplate = this.dataService.getStandardTemplates().subscribe(res => {
        for (const key in res[0]) {
          res[0][key].forEach(item => {
              item.selected = key == 'generalCompliances' || key == 'technicalBestPractices' || key == 'additionalRequirements'
                              ? true : false;
              item.applicability = true;
          });
        }
        this.child.getComplianceItems(res[0]);
      }
      );
  }

  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    if (this.standardTemplate) {
      this.standardTemplate.unsubscribe();
    }
    // *****************************************************/
  }

}
