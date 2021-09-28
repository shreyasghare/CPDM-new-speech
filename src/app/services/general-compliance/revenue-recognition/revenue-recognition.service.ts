import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { RclassessmentQuestionnaire } from '@cpdm-model/general-compliances/revenue-recognition/rclAssessmentQuestionnaire.model';
import { RevenueRecognitionModel } from '@cpdm-model/general-compliances/revenue-recognition/revenueRecognition.model';

@Injectable({
  providedIn: 'root'
})
export class RevenueRecognitionService {
  private complianceId: string = null;
  private projectName: string = null;
  private projectId: string = null;
  private complianceRefID: string = null;
  private revRecSubObj = new Subject<any>();
  constructor(private http: HttpClient, private userDetailsService: UserDetailsService) { }

   /**
   * Method to get any data from revenuerecognition node
   * @param path get method path
   */
  getDataByPath(path: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/revenuerecognition/${path}`);
  }

  setRevRecComplianceId(complianceId): void {
    this.complianceId = complianceId;
  }

   get getRevRecComplianceId(): string {
    return this.complianceId;
  }

  setProjectId(projectId): void {
    if (projectId) {
      sessionStorage.setItem('projectId', projectId);
      this.projectId = projectId;
    }
  }

  get getProjectId(): string {
    if (sessionStorage.getItem('projectId')) {
      this.projectId = sessionStorage.getItem('projectId');
    }
    return this.projectId;
  }

  setComplianceRefID(complianceRefID: string): void {
    this.complianceRefID = complianceRefID;
  }

  get getComplianceRefID(): string {
    return this.complianceRefID;
  }

  /**
   * post method to start the rev-rec process
   * @param projectId current poject ID
   * @param complianceItemsId compliance item id
   */
  startRevRecProcess(projectId: string, complianceItemsId: string,betaFlag:boolean ): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    const obj = {projectId, complianceItemsId, betaFlag};
    return this.http.post(`${environment.apiUrl}/api/v1/revenuerecognition`, obj, { headers });
  }

  // method to get the scoping-checklist[New_PID_List] for PM
  getScopingChecklist(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/excel/revRec/scopingChecklist`, {responseType: 'blob'});
  }

  // method to get the projectId from rev-rec collection
  getProjectIdFromRevRec(revRecId): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/revenuerecognition/${revRecId}`);
  }

  // method to create rcl doc
  generateRclDocFromNode(revRecId, projectName, docCentralPostBody): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/word/revenueRecognition/rcl/${revRecId}/${projectName}`, docCentralPostBody);
  }

  // Put methods
  updateRclQuestionnaire(id: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${id}/rclassessmentquestionnaire`, body);
  }

  updateRevRecPOComments(id: string, body: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${id}/revRecPOComments`, body, {headers});
  }

  reviewApproval(id: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${id}/reviewApproval`, body);
  }

  getPostedRclQuestionnaire(id: string): Observable<RclassessmentQuestionnaire> {
    return this.http.get<RclassessmentQuestionnaire>(`${environment.apiUrl}/api/v1/revenuerecognition/${id}/rclassessmentquestionnaire`);
  }

  getRevRecObj(id: any): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/revenuerecognition/${id}`);
  }

  patchEdcsObj(revRecId: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/edcs/${revRecId}`, body);
  }

  patchStatusObj(revRecId: string, step: string, body: any): Observable<any> {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
      return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${revRecId}/status/${step}`, body, {headers});
  }

  getRevRecUpdateListener(): Observable<any> {
    return this.revRecSubObj.asObservable();
  }

  enableNextSidebarItem(itemName: string): void {
    this.revRecSubObj.next(itemName);
  }

  patchFmvObj(revRecId: string, body: any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('user', JSON.stringify(this.userDetailsService.currentUserValue));
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/fmvDocObj/${revRecId}`, body, {headers});
  }

  patchFmvDocUodateObj(revRecId: string, edcsID: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${revRecId}/updateFmvDoc/${edcsID}`, body);
  }

  getAllBuControllers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/users/find/BUController`);
  }

  getBusinessUnitsForBUController(userID: string, businessEntity: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/users/find/businessUnits/${userID}/${businessEntity}`);
  }

  setBuController(
    projectId: string, condition: string, _id?: string, name?: string,
    cecId?: string, bussinessEntity?: string, businessUnit?: string): Observable<any> {
    let body = {};
    if (condition === 'add') {
      body = { _id, cecId, name, bussinessEntity };
    } else if (condition === 'addBusinessUnit' || condition === 'addBusinessUnitNotify') { body = { businessUnit }; }

    return this.http.post(`${environment.apiUrl}/api/v1/revenuerecognition/bucontroller/${projectId}/${condition}`, body);
  }

  setUpdateAlternateProxy(projectId: string, condition: string, alternateProxy?: { cecId: string, name: string }): Observable<any> {
    let body = {};
    if (condition === 'add') { body = { alternateProxy }; }
    return this.http.post(`${environment.apiUrl}/api/v1/revenuerecognition/alternateproxy/${projectId}/${condition}`, body);
  }

  updateSkipPidListDetails(id: string, body: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/revenuerecognition/${id}/updateSkipPidListDetails`, body);
  }
  /**
   * @description service to update rev rec object
   */
  updateRevRecObject(revRecId: string, reqBody: {}): Observable<{ success: boolean, data: RevenueRecognitionModel }> {
    return this.http.put<{ success: boolean, data: RevenueRecognitionModel }>
                        (`${environment.apiUrl}/api/v1/revenuerecognition/${revRecId}/updateobject`, reqBody);
  }
}
