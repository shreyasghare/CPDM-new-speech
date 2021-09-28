import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import AdrStatus from '@cpdm-model/general-compliances/accessibility/identify-adrs/adrItems/adrStatus.model';
import AdrItemsCount from '@cpdm-model/general-compliances/accessibility/identify-adrs/adrItems/adrItemsCount.model';
import { AdrItems } from '@cpdm-model/general-compliances/accessibility/identify-adrs/adrItems/adrItems.model';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityProcessService {
  private accessibilityObj = {};
  private getAccessibilityObjSub = new Subject<any>();
  private currentPorjectId: string;
  private userCcid: string;
  projectName: string;

  private enableSidebarTab = new Subject<any>();
  projectDetails: any;

  constructor(
    private http: HttpClient,
    private userDetailsService: UserDetailsService) {
    const user = this.userDetailsService.currentUserValue;
    this.userCcid = user.cecId;
  }

   // Method to send implementation comments by PM
  sendImpolentationCommentsByPM(comments: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/pmImplComments`, comments);
  }

  getImplementationComments(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/pmImplComments/`);
  }

  getTableData(tableName: string, projectId: string, readOnly = false): Observable<AdrItems> {
    const query = readOnly ? '?selected=true' : '';
    return this.http.get<AdrItems>(`${environment.apiUrl}/api/v1/accessibility/adr/${tableName}/${projectId}${query}`);
  }

  getAccessibilityCountById(projectId: string): Observable<AdrItemsCount> {
  return this.http.get<AdrItemsCount>(`${environment.apiUrl}/api/v1/accessibility/adrCount/${projectId}`);
  }

  getAdrStatus(): Observable<AdrStatus> {
    return this.http.get<AdrStatus>(`${environment.apiUrl}/api/v1/accessibility/adrStatus`);
  }

  getRallyWorkspacesByApiKey(apiKey: any, projectId: string): Observable<any> {
  //  return this.http.get(`http://10.76.176.43:4200/api/v1/adr/rally/workspaces/${apiKey.trim()}/${projectId}`);
   return this.http.get(`${environment.apiUrl}/api/v1/accessibility/rally/workspaces/${apiKey.trim()}/${projectId}`);
  }
  // To get status of each adr item in Web and other categories for particular project id.

  getAdrItemStatus(projectID: string): Observable<any> {
  // return this.http.get(`${environment.apiUrl}/api/v1/adr/${projectID}`);
    return this.http.get('assets/adrItemStatus.json');
  }
  postAdrTableContents(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/adr/project/accessibility`, data);
  }

  sendFeatureObjectByPM(featureObj): Observable<any> {
   
    // old end point (feature as parent  -> engFeature/US as 4 adr types & all concated adr will be in description) 
    // return this.http.post(`${environment.apiUrl}/api/v1/accessibility/rally/feature`, featureObj);
   
    // New end point (feature as super parent-> engFeature/US as parent ie. 4 adr types -> US per adr)
       return this.http.post(`${environment.apiUrl}/api/v1/accessibility/rally/backlog`, featureObj);   
  }

  /**
   * Updating data for manual step
   * @param adrImplObj
   */
  sendManualImplObjectByPM(adrImplObj: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/adrImplementation/manual`, adrImplObj);
  }

  sendImplStatusByPM(statusObj, header?): Observable<any> {
    if (header) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('user', JSON.stringify(header.user.userObj));
      headers = headers.append('adrProcess', header.adrProcess);
      return this.http.put(`${environment.apiUrl}/api/v1/accessibility/implementation`, statusObj, {headers});
    }
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/implementation`, statusObj);
    // return this.http.put(`http://10.76.176.74:4200/api/v1/accessibility/implementation`, statusObj);
  }

  getIsUserIsPmOrPo(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/users/${userId}/role`);
  }

  startAccessibilityProcess(body: any, header?: any): Observable<any> {
    // const headers = new HttpHeaders()
    // headers.append("user", header.user);
    // headers.append("adrProcess", header.adrProcess);
    if (header) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('user', JSON.stringify(header.user.userObj));
      headers = headers.append('adrProcess', header.adrProcess);
      return this.http.post(`${environment.apiUrl}/api/v1/accessibility/`, body, {headers});
    }
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/`, body);

  }

  getAccessibilityForProject(projectId?: string): void {
    // Assigning saved/given project id to the service
    const getProId = projectId ? projectId : this.currentPorjectId;
    // ----------------------------------------------------------------

    // calling backend service to get the obj
    this.http.get(`${environment.apiUrl}/api/v1/accessibility/${getProId}/adr`).subscribe(res => {
      this.accessibilityObj = res[0];
      this.getAccessibilityObjSub.next(this.accessibilityObj);
    });
    // -------------------------------------------------------------------------------------

    // Saving Current Project Id
    if (this.currentPorjectId === undefined && projectId) {
      this.currentPorjectId = projectId;
    }
    // ------------------------------------------------------------------------------------------
  }

  updateAccessibilityObj(data: any): void {
    this.getAccessibilityObjSub.next(data);
  }

  getUpdatedAccessibilityObj(projectId): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/${projectId}/adr`);
  }

  getAccessibilityUpdateListner(): Observable<any> {
    return this.getAccessibilityObjSub.asObservable();
  }

  getAccessibilityObj(): any {
    return this.accessibilityObj;
  }

  getTableDataForPO(projectID: any): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/${projectID}/adr`);
  }

  sendAdrComment(projectID: string, commentObj): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/${projectID}/comment/adr`, commentObj);
  }

  getCommentsForAdr(readCommentObj: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/${readCommentObj.projectId}/adr/
    ${readCommentObj.adrType}/${readCommentObj.adrId}/readComment`, readCommentObj);
  }

  putPoApproval(updatedObj: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility`, updatedObj);
  }

  putSkipOverview(projectID: string, updatedObj: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/${projectID}/skipOverview`, updatedObj);
  }

  getOverviewSelection(projectId, overview): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/adrSubObject/${projectId}/${overview}`);
  }

  // Doc Central download vpat blob file
  downloadVpatFromNode(projectId: string, workspacePath: string, filename: string): Observable<any> {
  // downloadVpatFromNode(projectId: string):Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/v1/word/vpatDoc?path=${workspacePath}`, {responseType: 'blob'});
    // return this.http.get(`${environment.apiUrl}/api/v1/word/policyTesting/${projectId}`, {responseType:'blob'});
  }

  // Doc Central download policy-testing blob file
  downloadPolicyTestingFromNode(projectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/word/policyTesting/${projectId}`, {responseType: 'blob'});
  }

  connectJira(jiraServer): Observable<any> {
    const oauthData: any = {ccid: '', application: ''};
    oauthData.ccid = this.userCcid;
    oauthData.application = 'jira';
    oauthData.jiraUrl = jiraServer;
    //
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/authenticate`, oauthData);
   // return empty();
  }

  postTokenData(oauthData): Observable<any> {
    //
    oauthData.ccid = this.userCcid;
    oauthData.application = 'jira';
    //
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/verifier`, oauthData);

  }

  createJiraIssue(issueData): Observable<any> {
    issueData.ccid = this.userCcid;
    issueData.application = 'jira';
    //
    // return empty();
    // return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/issue`, issueData);
    // old call (Epic as parent -> selected Issue type as 4  child per adr type with all concated adr in description )
    //   return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/createEpic`, issueData);

    //new call (Epic as super parent-> selected Issue type as parent ie. 4 adr types -> issue type "Sub-task" per adr)
     return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/backlog`, issueData);
  }

  getJiraPorjects(jiraServer): Observable<any> {
    const oauthData: any = {ccid: '', application: ''};
    //

    oauthData.ccid = this.userCcid;
    oauthData.application = 'jira';
    oauthData.jiraUrl = jiraServer;

    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/projects`, oauthData);
  }


  getJiraIssueTypeMeta(jiraServer, jiraProjectKey): Observable<any> {
    const oauthData: any = {ccid: '', application: ''};
    //

    oauthData.ccid = this.userCcid;
    oauthData.application = 'jira';
    oauthData.jiraUrl = jiraServer;
    oauthData.jiraProjectKey = jiraProjectKey;

    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/getIssueTypeMeta`, oauthData);
  }

  getJiraIFieldMeta(jiraServer, jiraProjectKey, jiraIType): Observable<any> {
    const oauthData: any = {ccid: '', application: ''};
    //

    oauthData.ccid = this.userCcid;
    oauthData.application = 'jira';
    oauthData.jiraUrl = jiraServer;
    oauthData.jiraProjectKey = jiraProjectKey;
    oauthData.jiraIssueTypeName = jiraIType;

    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/getIssueFieldMeta`, oauthData);
  }

  isTokenPresent(app, jiraUrl): Observable<any> {
    const oauthData: any = {ccid: '', application: ''};


    oauthData.ccid = this.userCcid;
    oauthData.application = app;
    oauthData.jiraUrl = jiraUrl;

    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/jira/isTokenPresent`, oauthData);
  }

  // Rally API Calls

  connectRally(): Observable<any> {

    const oauthData = {ccid: '', application: ''};
    oauthData.ccid = this.userCcid;
    oauthData.application = 'rally';
    //
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/rally/authenticate`);
   // return empty();
  }

  postRallyTokenData(oauthData): Observable<any> {
    //
    oauthData.ccid = this.userCcid;
    oauthData.application = 'rally';
    //
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/rally/verifier`, oauthData);

  }

  getWorkspaces(): Observable<any> {
    //
    const oauthData = {ccid: '', application: ''};
    oauthData.ccid = this.userCcid;
    oauthData.application = 'rally';
    //
    return this.http.post(`${environment.apiUrl}/api/v1/accessibility/rally/getWorkspaces`, oauthData);

  }

  getRallyPorjects(workspaceRef): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/rally/getProjectByWorkspace?ccid=${this.userCcid}&application=rally&workspaceRef=${workspaceRef}`);
  }

  getJiraServerList(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/jira/servers`);
  }

  getBacklogDetails(projectId): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/accessibility/adrSubObject/${projectId}/implementation`);
  }


  // getProjectName():string{
  //   return this.projectDetails.name;
  // }


  // Change sidebar
  sidebarTabsSubscription(): Observable<any> {
    return this.enableSidebarTab.asObservable();
  }

  // To change sidebar tab
  enableNextSidebarItem(itemName: string) {
    this.enableSidebarTab.next(itemName);
  }

  putAdrComments(commentObj: any, header?: any): Observable<any> {
    if (header) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('user', JSON.stringify(header.user.userObj));
      headers = headers.append('adrProcess', header.adrProcess);
      return this.http.put(`${environment.apiUrl}/api/v1/accessibility/adrApproveReject`, commentObj, {headers});
    }
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/adrApproveReject`, commentObj);
  }

  // to update progress score of accessibility
  updateProgressScore(projectId: string, body: {progressScore: number}, step: string) {
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/updateProgressScore/${projectId}/${step}`, body);
  }

  // to update workflow timestamp
  updateWorkflowTimestamp(projectId: string, body: {step: string}, adrProcess: string = null): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    if (adrProcess) {
      headers = headers.append('user', JSON.stringify(this.userDetailsService.getLoggedInUserObject));
      headers = headers.append('adrProcess', adrProcess);
    }
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/updateWorkflowTimestamp/${projectId}`
    , body, adrProcess ? {headers} : {});
  }

  validateFile(file: any, projectID, userId, skipFlag): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('skipFlag', skipFlag);
    
    return this.http.post(`${environment.apiUrl}/api/v1/word/${projectID}/validateFile`, formData);
  }

  updateAdrItems(projectId: string, updateQuery: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/api/v1/accessibility/adrItems/${projectId}`, updateQuery);
  }
}
