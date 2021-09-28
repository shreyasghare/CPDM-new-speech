import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent implements OnInit {
  projectId: any;
  projectName: any;
  apiResponseReady: boolean;

  constructor(private activatedRoute: ActivatedRoute,
              private projectDetails: ProjectsDataService) { }

  // create project event to get project name
  getProName(event: any): void {
    this.projectName = event;
  }


  ngOnInit() {
    this.projectId = this.activatedRoute.snapshot.params.id;
  }

}
