import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, empty } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { InfoHelperModel } from '@cpdm-model/InfoHelperModel';


@Injectable({
  providedIn: 'root'
})

export class ProjectsDataService {

  private projectName: string;
  standardTemplate: any;
  constructor(private http: HttpClient, private userDetailsService: UserDetailsService) { }

  // Method to Get projects by user role
  getProjects(pageNumber: number): Observable<any> {
    const httpOptions = new HttpHeaders({
      page: pageNumber.toString(),
      user_role: this.userDetailsService.userRole

    });
    return this.http.get(`${environment.apiUrl}/api/v1/projects/user`, { headers: httpOptions });
  }

  /**
   * Get request for filtered projects by name, owner and assignee
   * @param pageNumber
   * @param searchText
   */
  searchProjects(pageNumber: number, searchText: string): Observable<any> {
    const httpOptions = new HttpHeaders({
      page: pageNumber.toString(),
      user_role: this.userDetailsService.userRole,
      search_text: searchText
    });
    return this.http.get(`${environment.apiUrl}/api/v1/projects/search`, { headers: httpOptions });
  }

  // Method to get project details by id
  getProjectDetails(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/${id}`);
  }

  // Method to check project name
  projectNameExists(projectName: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/projects/unique`, {projectName});
  }


  dummyData(): Observable<any> {
    return this.http.get('assets/dummyProjectDetailsData.json');
  }

  // Method to fetch business entity
  getBusinessEntity(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projectProfile/businessEntities`);
  }

  // Method to fetch sub-business entity
  getSubBusinessEntity(businessEntity: String): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projectProfile/businessEntities/${businessEntity}`);
    // return this.http.get('assets/demo.json');
  }

  // Method to fetch product types
  getProductTypes(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projectProfile/productTypes`);
  }

  // Method to fetch development styles
  getDevelopmentStyles(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projectProfile/developmentStyles`);
  }

  // Method to fetch templates
  getTemplates(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/templates`);
  }

  // Method to fetch standard templates
  getStandardTemplates(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/standards`);
  }

  setStandardTemplate(st: any) {
    this.standardTemplate = st;
  }

  getSavedStandardTemplate() {
    return this.standardTemplate;
  }
// Method to fetch tooltip description
  getTooltipDesc(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/toolHelper/`);
  }

  // method to fetch info helper desc
  getItemDesc(name: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/toolHelper/${name}`);
  }

  // new info helper
  getInfoHelper(workflowName: string, stepName: string, title: string): Observable<{ success: boolean, data: InfoHelperModel }> {
    const apiParams = title ? `${workflowName}/${stepName}?title=${encodeURIComponent(title)}` : `${workflowName}/${stepName}`;
    return this.http.get<{ success: boolean, data: InfoHelperModel }>(`${environment.apiUrl}/api/v1/infoHelper/${apiParams}`);
  }
  // getItemDesc(): Observable<any> {
  //   return this.http.get(`${environment.apiUrl}/api/v1/toolHelper`);
  //   // return this.http.get('assets/tooltipHelper.json');
  // }
  // Method to post project
  createNewProject(project: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/projects`, project);
  }

  // fetch help me select questions
  getHelpMeSelectOptions(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/wizard`);

  }

  // Method to update Project
  updateProject(project: any, projectId: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.getLoggedInUserObject));
    return this.http.put(`${environment.apiUrl}/api/v1/projects/projectProfile/${projectId}`, project, { headers });
  }

  // Method to fetch data for export PPT.
  getPptData(projectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/${projectId}/exportCommit`);
  }

  // Download generated PPT data from node
  downloadPptGenJs(projectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/ppt/generate/${projectId}`, {responseType: 'blob'});
  }

  // get getProjectName():string{
  //   const getProNameFromSession = sessionStorage.getItem('projectName');
  //   if(getProNameFromSession){
  //     return getProNameFromSession;
  //   }else{
  //     return this.projectName;
  //   }
  // }

  // setProjectName(projectName): void {
  //   if(projectName){
  //     sessionStorage.setItem('projectName',projectName);
  //     this.projectName = projectName;
  //   }
  // }

  // get getProjectName(): string {
  //   if(sessionStorage.getItem('projectName')){
  //     this.projectName = sessionStorage.getItem('projectName');
  //   }
  //   return this.projectName;
  // }

  getComplianceIdByName(projectId: string, complianceItemName: string,
    state: string, complianceType: string = 'complianceItems'): Observable<any> {
    const body = {projectId, complianceItemName, complianceType};
    return this.http.post(`${environment.apiUrl}/api/v1/projects/${state}`, body);
  }
}

