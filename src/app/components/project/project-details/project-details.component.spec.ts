import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { from } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';

let fixture: ComponentFixture<ProjectDetailsComponent>;
let projectsDataService: ProjectsDataService;
let component: ProjectDetailsComponent;
let ActivatedRouteStub: any;
let ProjectsDataServiceStub: any;
const dummyData = [1, 2, 3];

xdescribe('ProjectDetailsComponent', () => {
  ActivatedRouteStub = {
  snapshot: {
    params: {id: '123'}
  }
};
  ProjectsDataServiceStub = {
getProjectDetails() {
  return from([dummyData]);
}
};
// component=TestBed.get

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
          AppModule, RouterTestingModule
      ],
      declarations: [

      ],
      providers: [
        ProjectsDataService,
        {provide: ProjectsDataService,
        useValue: ProjectsDataServiceStub},
        {
          provide: ActivatedRoute,
          useValue: ActivatedRouteStub
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
    projectsDataService = TestBed.get(ProjectsDataService);
    fixture.detectChanges();
  });

  it('should create ProjectDetailsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should get route params as provided', () => {
    component.ngOnInit();
    expect(component.projectId.toString()).toEqual('123');
  });


  // it("should use the projectDetails data from the service", () => {

  //   projectsDataService=new ProjectsDataService(null);
  //   component=new ProjectDetailsComponent(ActivatedRouteStub,projectsDataService);
  //   let dummyData={TechnicalStandardItems:'1'};
  //   spyOn(projectsDataService,'getProjectDetails').and.callFake(()=>{
  //          return from([dummyData]);
  //   })

  //   component.ngOnInit();

  //   expect(component.TechnicalStandardItems).toEqual(dummyData.TechnicalStandardItems);

  // });

/*
  it("should use the projectDetails from the service", () => {
    const projectService = fixture.debugElement.injector.get(ProjectsDataService);
    let dummyData=[1,2,3];
    let result=spyOn(projectsDataService, 'getProjectDetails').and.returnValue(from([dummyData]));
     component.ngOnInit();
    expect(projectService.getProjectDetails()).toEqual(result);
  });

  it('should call service getProjectDetails', () => {

    let dummyData=[1,2,3];
    let result=spyOn(projectsDataService, 'getProjectDetails').and.returnValue(from([dummyData]));
    component.ngOnInit();
    // expect(result).toHaveBeenCalled();
    expect(result).toEqual(dummyData);
  });
*/
});
