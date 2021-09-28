import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalizationModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DocCentral } from '@cpdm-model/DocCentral';

@Injectable({
  providedIn: 'root'
})
export class GlobalizationService {
  private globalizationDataSource$ = new BehaviorSubject<GlobalizationModel>(null);
  getGlobalizationDataSub = this.globalizationDataSource$.asObservable();

  constructor(private http: HttpClient) {}

  getGlobalizationData(globalizationId: string): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.get<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}`);
  }

   /**
   * @description BehaviorSubject service to update Globalization data
   * @param globalizationData
   */
    updateGlobalizationDataWithSubject(globalizationData: GlobalizationModel) {
    this.globalizationDataSource$.next(globalizationData);
  }

  /**
   * @description service to save Define Startegy chevron
  */
   updateDefineStrategyObject(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/defineStategy/next`, updateObject);
  }

  /**
   * @description service to save Service Selection option
  */
   updateServiceSelectionOption(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/serviceRequest/serviceSelection`, updateObject);
  }

  /**
   * @description service to update Service Selection chekbox values
  */
   updateServiceSelectionChkBoxValues(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/serviceRequest/serviceRequestList`, updateObject);
  }//serviceRequestList

   /**
   * @description service to update Service Selection chekbox values
  */
    saveRequirementCheckListItems(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
      return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/requirementsChecklist/checklistSection/save`, updateObject);
    }

  /**
   * @description service to update Service Request Questionaire
  */
  updateServiceRequestQuestionaireObject(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/serviceRequest/serviceRequestQuestionaire`, updateObject);
  }

  /**
   * @description service to update Service Request Tab Status on click next
  */
  updateServiceRequestTabSatus(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/serviceRequest/next`, updateObject);
  }

  /**
   * @description service to update Service Request Tab Status on click next
  */
   submitRequirementsChecklistTab(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/requirementsChecklist/submit`, updateObject);
  }
  
  /**
   * @description service to update Service Request Tab Status on click next
  */
  requirementsChecklistApprove(globalizationId: string, updateObject: any): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/requirements/requirementsChecklist/approve`, updateObject);
  }
  /**
   * @description Updates service request item
   * @param { string } globalizationId Globalization Id
   * @param { { projectId: string, uniqueKey: string, value: boolean } } requestObject Service request item object
   * @returns { success: boolean, data: GlobalizationModel }
   */
  updateImplServiceRequestList(globalizationId: string, requestObject: { projectId: string, uniqueKey: string, value: boolean }): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/implementation/serviceRequest/serviceRequestList`, requestObject);
  }

  /**
   * @description implementation step data submit
   * @param { string } globalizationId Globalization Id
   * @param { { projectId: string, comments: [{ comment: string, commentedBy: string, commentedOn: Date }]} } requestObject Request object to submit
   * @returns { success: boolean, data: GlobalizationModel }
   */
  submitImplementation(globalizationId: string, requestObject: { projectId: string, comments: [{ comment: string, commentedBy: string, commentedOn: Date }]}): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/implementation/submit`, requestObject);
  }

  /**
   * @description Update EDCS details
   * @param { string } globalizationId Globalization Id
   * @param { { projectId: string, document: DocCentral } } edcsPatchBody EDCS details
   * @returns { success: boolean, data: GlobalizationModel }
   */
  patchEdcsObj(globalizationId: string, edcsPatchBody: { projectId: string, document: DocCentral }): Observable<{ success: boolean, data: GlobalizationModel }> {
    return this.http.put<{ success: boolean, data: GlobalizationModel }>(`${environment.apiUrl}/api/v1/globalization/${globalizationId}/edcs`, edcsPatchBody);
  }
}
