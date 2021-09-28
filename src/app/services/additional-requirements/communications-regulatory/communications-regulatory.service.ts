import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationsRegulatoryModel, CRCRecommendationsObjectModel, ImplementationReportModel, RecommendationsModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { CrcAssessmentQuestionnaire } from '@cpdm-model/additional-requirements/communications-regulatory/crcAssessmentQuestionnaire.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunicationsRegulatoryService {
  private crcDataSource$ = new BehaviorSubject<CommunicationsRegulatoryModel>(null);
  getCrcDataSub = this.crcDataSource$.asObservable();

  private recommendationDataSource$ = new BehaviorSubject<CRCRecommendationsObjectModel>(null);
  getRecommendationDataSub = this.recommendationDataSource$.asObservable();

  private crcQuestionnaireDataSource$ = new BehaviorSubject<CrcAssessmentQuestionnaire>(null);
  getCrcQuestionnaireDataSub = this.crcQuestionnaireDataSource$.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * @description service to get Communications Regulatory data
   */
   getCrcData(crcId: string): Observable<{ success: boolean, data: CommunicationsRegulatoryModel }> {
    return this.http.get<{ success: boolean, data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/${crcId}`);
  }

  /**
   * @description BehaviorSubject service to update CRC data
   * @param crcData
   */
   updateCrcDataWithSubject(crcData: CommunicationsRegulatoryModel) {
    this.crcDataSource$.next(crcData);
  }

  /**
   * @description BehaviorSubject service to update recommendation data
   * @param { CRCRecommendationsObjectModel } recommendationData
   */
  updateRecommendationDataWithSubject(recommendationData: CRCRecommendationsObjectModel) {
    this.recommendationDataSource$.next(recommendationData);
  }

   /**
   * @description Subject service to get assessment questionnaire
   * @param queData
   */
    updatecrcQuestionnaireDataSource(queData: CrcAssessmentQuestionnaire) {
      this.crcQuestionnaireDataSource$.next(queData);
    }

    getCrcQuestionnaire(crcId: string, projectId: string): Observable<any> {
      return this.http.get(`${environment.apiUrl}/api/v1/communicationsRegulatory/crcOnlyQuestionnaire/${crcId}`);
    }

  /**
   * @description Service to get the assessment questionnaire
   * @returns { data: CrcAssessmentQuestionnaire }
   */

  getUpdatedCrcQuestionnaire(crcId: string): Observable<{ success: boolean, data: CrcAssessmentQuestionnaire }> {
    return this.http.get<{ success: boolean, data: CrcAssessmentQuestionnaire }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/crcQuestionnaire/${crcId}`);
  }

  /**
   * @description Service to update the assessment questionnaire
   * @param { string } crcId
   * @param { CrcQuestionAnswer } requestObj
   * @returns { success: boolean, data: CommunicationsRegulatoryModel }
   */
  updateQuestionnaireObject(crcId: string, requestObj: any): Observable<{ success: boolean, data: CommunicationsRegulatoryModel }> {
    return this.http.put<{ success: boolean, data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/crcQuestionnaireList/${crcId}`, requestObj);
  }

  /**
   * @description Get CRC recommendations
   * @param { string } crcId
   * @returns { success: boolean, data: CRCRecommendationsObjectModel }
   */
  getRecommendations(crcId: string): Observable<{ success: boolean, data: CRCRecommendationsObjectModel }> {
    return this.http.get<{ success: boolean, data: CRCRecommendationsObjectModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/recommendations/${crcId}`);
  }

  /**
   * @description Create/Save CRC recommendations
   * @param { string } crcId
   * @param { CRCRecommendationsObjectModel } requestObj
   * @returns { success: boolean, data: CRCRecommendationsObjectModel }
   */
  saveRecommendations(crcId: string, requestObj: CRCRecommendationsObjectModel): Observable<{ success: boolean, data: CRCRecommendationsObjectModel }> {
    return this.http.post<{ success: boolean, data: CRCRecommendationsObjectModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/recommendations/${crcId}`, requestObj);
  }

  /**
   * @description Update CRC details object
   * @param { string } crcId
   * @param { CommunicationsRegulatoryModel } requestObj
   * @returns { success: boolean, data: CommunicationsRegulatoryModel }
   */
  updateCrcDetails(crcId: string, requestObj: CommunicationsRegulatoryModel): Observable<{ success: boolean, data: CommunicationsRegulatoryModel }> {
    return this.http.put<{ success: boolean, data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/${crcId}`, requestObj);
  }

  /**
   * @description API to update CRC recommendations comment
   * @param recId crcRecommendations Id
   * @param recommendations recommendations to update
   * @returns {success: boolean, message: string}
   */
  updateCrcRecommendationsComment(recId: string, recommendations: RecommendationsModel[]): Observable<{success: boolean, message: string}> {
    return this.http.put<{success: boolean, message: string}>(`${environment.apiUrl}/api/v1/communicationsRegulatory/recommendations/comment/${recId}`, recommendations);
  }

  /**
   * Populate Jira & rally backlog
   * @param body
   */
   populateBacklog(body: { selectedRepo: string, userId: string, _id: string, projectId: string, workspacePath: string, workspaceId:string, communicationsRegulatoryId: string }): Observable<{ data: CommunicationsRegulatoryModel }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('timeout', '300000'); // 5 min
    return this.http.post<{ data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/${body.selectedRepo}/backlog`, body, { headers });
  }

  /**
   * submit implementation report
   * @param body
   */
  sendImplReport(body: ImplementationReportModel): Observable<{ data: CommunicationsRegulatoryModel }> {    
    return this.http.put<{ data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/implementation/report/${body.crcId}`, body);
  }

  completeManualSetp(body: {crcId: string}): Observable<{ data: CommunicationsRegulatoryModel }>{
    return this.http.put<{ data: CommunicationsRegulatoryModel }>(`${environment.apiUrl}/api/v1/communicationsRegulatory/implementation/manual`, body);
  }
    
}
