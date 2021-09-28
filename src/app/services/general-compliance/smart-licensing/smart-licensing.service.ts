import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { SmartLicensingModel } from '@cpdm-component/general-compliance/smart-licensing/models/SmartLicensingModel';
import { InitiateQuestionerModel, SEEMNotificationInterface, SLProcessQuestionnaireinterface } from '@cpdm-model/smartLicensing';


@Injectable({
  providedIn: 'root'
})
export class SmartLicensingService {
  private sLSubObj = new Subject<any>();

  constructor(private http: HttpClient, private userDetailsService: UserDetailsService) { }

  start(body): any {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    return this.http.post(`${environment.apiUrl}/api/v1/smartLicensing`, body, { headers });
  }

  // method to get the projectId from SL collection
  getSmartLicensingData(slId: string): Observable<{ success: boolean, data: SmartLicensingModel }> {
    return this.http.get<{ success: boolean, data: SmartLicensingModel }>(`${environment.apiUrl}/api/v1/smartLicensing/${slId}`);
  }

  // method to get static data from master collection
  getROTaskData(step): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/smartLicensing/readonlyTaskData/${step}`);
  }

  // method to add review object
  updateReviewObject(id: string, reviewObjName, body: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    return this.http.put(`${environment.apiUrl}/api/v1/smartLicensing/review/${id}/${reviewObjName}`, body, { headers });
  }

  invitetoSLWebinr(body): any {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    return this.http.post(`${environment.apiUrl}/api/v1/smartLicensing/invitetoSLWebinr`, body, { headers });
  }

  getQuestionnare(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/smartLicensing/questionnaire`);
  }

  postQuestionnaire(engagementRequestForm: any, id: string, skipFlag?: boolean): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    const body = engagementRequestForm;
    if(skipFlag)
    { body['skipFlag'] = skipFlag; } 
    return this.http.post(`${environment.apiUrl}/api/v1/smartLicensing/questionnaire/${id}`, body, { headers });
  }

  getAnsweredQuestionnaire(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/smartLicensing/questionnaire/${id}`);
  }

  patchEdcsObj(smartLicensingId: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/smartLicensing/edcs/${smartLicensingId}`, body);
  }

  // method to update the status
  updateStatus(sLid: string, body: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.getLoggedInUserObject));
    return this.http.put(`${environment.apiUrl}/api/v1/smartLicensing/${sLid}/status`, body, { headers });
  }


  /**
   * Populate Jira & rally backlog
   * @param body
   */
  populateBacklog(body: { selectedRepo: string, userId: string, _id: string, projectId: string, workspacePath: string }): Observable<{ data: SmartLicensingModel }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('timeout', '300000'); // 5 min
    return this.http.post<{ data: SmartLicensingModel }>(`${environment.apiUrl}/api/v1/smartLicensing/${body.selectedRepo}/backlog`, body, { headers });
  }

  /**
    * Updating data for manual implementation method
    * @param smartLicensingId
    */
  registerManualImplementation(smartLicensingId: { smartLicensingId: string }): Observable<{
    success: boolean,
    data: SmartLicensingModel
  }> {
    return this.http.post<{
      success: boolean,
      data: SmartLicensingModel
    }>(`${environment.apiUrl}/api/v1/smartLicensing/implementation/manual`, smartLicensingId);
  }

  getBacklogDetails(projectId): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/smartLicensing/slSubObject/${projectId}/implementation`);
  }

  getSLUpdateListener(): Observable<any> {
    return this.sLSubObj.asObservable();
  }

  enableNextSidebarItem(itemName: string, skipFlag?: boolean): void {
    this.sLSubObj.next({ itemName, skipFlag });
  }


  updateSslWebinarAttend(body): any {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.getLoggedInUserObject));
    return this.http.put(`${environment.apiUrl}/api/v1/smartLicensing/updateSslWebinarAttend`, body, { headers });
  }

  updateSmartLicensingProcessQuestionnaire(body: SLProcessQuestionnaireinterface): Observable<{ success: boolean, data: InitiateQuestionerModel }> {
    return this.http.put<{ success: boolean, data: InitiateQuestionerModel }>(`${environment.apiUrl}/api/v1/smartLicensing/updateSmartLicensingProcessQuestionnaire`, body);
  }

  sendSEEMNotificationService(object: SEEMNotificationInterface): Observable<{ data: string, success: boolean }> {
    return this.http.post<{ data: string, success: boolean }>(`${environment.apiUrl}/api/v1/smartLicensing/sendSEEMIdentificationNotification`, object);
  }

  //To handle skips for implementation and testing step

  skipSLStatus(body): any {
    return this.http.post(`${environment.apiUrl}/api/v1/smartLicensing/skip/status`, body );
  }

 
}
