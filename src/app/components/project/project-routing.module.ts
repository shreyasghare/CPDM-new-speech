import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { EditProjectComponent } from './create-project/edit-project/edit-project.component';

const projectRoutes: Routes = [
  { path: 'create-project', component: CreateProjectComponent },
  { path: 'edit-profile/:id', component: EditProjectComponent },
  { path: ':id', component: ProjectDetailsComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(projectRoutes)
    ]
})

export class ProjectRoutingModule { }
