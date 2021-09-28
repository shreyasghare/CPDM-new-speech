import { TestBed } from '@angular/core/testing';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from  '@angular/common/http/testing';
import { AppModule } from './app.module';
import { RouterTestingModule } from '@angular/router/testing';

xdescribe('ProjectsDataService', () => {
  let  httpMock: HttpTestingController;
  let projectDataService: ProjectsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule, HttpClientTestingModule, RouterTestingModule, HttpClientModule
      ],
      declarations: [

      ],
      providers: [
        ProjectsDataService
      ]
    });
    projectDataService = TestBed.get(ProjectsDataService);
    httpMock = TestBed.get(HttpTestingController);

  });

  it('should be created instance of ProjectDataService', () => {
    expect(projectDataService).toBeTruthy();
  });

//   it('should return collection of project data', () => {
//     let response;
//     const getProjectDataResponse = [
//       {
//         "id":1,
//         "projectName":"Project 1",
//           "projectStatus":"No Commits",
//           "nextCommitDate":"21 Jan 2020",
//           "LastUpdatedDate":"1 Jan 2019"
//         },
//         {"id":2,
//           "projectName":"Project 2",
//         "projectStatus":"Pre-implementation commit",
//         "nextCommitDate":"21 Jan 2020",
//         "LastUpdatedDate":"1 Jan 2019"
//         }
//     ];


//     // projectDataService.getProjects(1).subscribe(res => {
//     //   response = res;
//     //   expect(response.length).toBe(2);
//     //   expect(response).toEqual(getProjectDataResponse);
//     // });

//     //hard coded as there will be actual url once api finalize
//     //TODO:update with constant
//     const  request = httpMock.expectOne(environment.apiUrl+'/projects/user');

//     expect(request.request.method).toBe("GET");

//     request.flush(getProjectDataResponse);

//     httpMock.verify();
//   });

//   it('should return collection of projectDetails data', () => {
//     let response;
//     const getProjectDetailsResponse = [
//       {
//         "id":1,
//         "complianceItems":"Accessibility",
//         "applicability":false,
//         "status":"21 Jan 2020",
//         "progress":50
//       },
//       {
//           "id":2,
//           "complianceItems":"Revenue Recognition",
//           "applicability":true,
//           "status":"21 Jan 2020",
//           "progress":15
//       },
//       {
//         "id":3,
//         "complianceItems":"Export Compliance",
//         "applicability":false,
//         "status":"21 Jan 2020",
//         "progress":25
//       }];
//    let someId='1';

//     projectDataService.getProjectDetails(someId).subscribe(res => {
//       response = res;
//       expect(response).toEqual(getProjectDetailsResponse);
//       expect(response.length).toBe(3);

//     });

//      //hard coded as there will be actual url once api finalize
//     //TODO:update with constant
//     const  request = httpMock.expectOne(`${environment.apiUrl}/api/v1/projects/${someId}`);

//     expect(request.request.method).toBe("GET");

//     request.flush(getProjectDetailsResponse);

//     httpMock.verify();

//   });

});
