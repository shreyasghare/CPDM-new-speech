import { Injectable } from '@angular/core';
import { TelemetryModel } from '@cpdm-model/technology-best-practices/telemetry/telemetry.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TelemetryRecommendationModel, Recommendation } from '@cpdm-model/technology-best-practices/telemetry/telemetryRecommendation.model';
import { TelemetryPlanFilterTableModel } from '@cpdm-model/technology-best-practices/telemetry/telemetryPlanFilterTable.model';
import { UpdateResponseTelemetryRecommendationModel } from '@cpdm-model/technology-best-practices/telemetry/updateResponseTelemetryRecommendation.model';

@Injectable()
export class TelemetryService {
  private _telemetryId: string = null;

  constructor(private http: HttpClient) { }
  private telemetryDataSource = new BehaviorSubject<TelemetryModel>(null);
  getTelemetryDataSub = this.telemetryDataSource.asObservable();
  updateTelemetryData(telemetryData: TelemetryModel) {
    this.telemetryDataSource.next(telemetryData);
  }

  get telemetryId(): string {
    return this._telemetryId;
  }

  setTelemetryId(objectId: string) {
    this._telemetryId = objectId;
  }
  /**
   * 
   * @param telemetryId
   */
  getTelemetryData(telemetryId: string): Observable<{ success: boolean, data: TelemetryModel }> {
    return this.http.get<{ success: boolean, data: TelemetryModel }>(`${environment.apiUrl}/api/v1/telemetry/${telemetryId}`);
  }
  /**
   * 
   * @param telemetryID 
   * @param updateObject 
   */
  updateTelemetryObject(telemetryID: string, updateObject: any):
  Observable<{ success: boolean, data: TelemetryModel }> {
    return this.http.put<{ success: boolean, data: TelemetryModel }>(`${environment.apiUrl}/api/v1/telemetry/${telemetryID}`, updateObject);
  }
  // Call to api to get telemetry recommendation
  getTelemetryRecommendationData(telemetryID: string): Observable<{ success: boolean, data: TelemetryRecommendationModel }> {
    return this.http.get<{ success: boolean, data: TelemetryRecommendationModel }>
       (`${environment.apiUrl}/api/v1/telemetry/${telemetryID}/recommendations`);
  }

  // Call to api to get telemetry filter table data
  getTelemetryPlanFilterTableData(telemetryID: string): Observable<{ success: boolean, data: TelemetryPlanFilterTableModel }> {
    return this.http.get<{ success: boolean, data: TelemetryPlanFilterTableModel }>
       (`${environment.apiUrl}/api/v1/telemetry/${telemetryID}/recommendation/filterData`);
  }     
  /**
  * Updating data for manual implementation method
  * @param telemetryId
  */
  registerManualImplementation(telemetryId: { telemetryId: string }): Observable<{success: boolean, data: TelemetryModel}> {
    return this.http.post<{success: boolean, data: TelemetryModel}>(`${environment.apiUrl}/api/v1/telemetry/implementation/manual`, telemetryId);
  }

  /**
   * Populate Jira & rally backlog
   * @param body
   */
  populateBacklog(body: {selectedRepo: string, userId: string, rallyProjectId: string, _id: string, selectedWS: string, projectId: string}): Observable<{data: TelemetryModel}> {
    return this.http.post<{data: TelemetryModel}>(`${environment.apiUrl}/api/v1/telemetry/${body.selectedRepo}/backlog`, body);
  }

  // Update table modal data
  updateTelemetryRecommendation(telemetryID: string, updateObject: {recommendations: Recommendation[]}):
    Observable<{success: boolean, data: UpdateResponseTelemetryRecommendationModel}> {
        return this.http.put<{success: boolean,
            data: UpdateResponseTelemetryRecommendationModel}>
            (`${environment.apiUrl}/api/v1/telemetry/${telemetryID}/recommendation`, updateObject);
  }

  reinitiateTelemetry(webApiId: string, updateObject: {workflow: { active: string, next: string }}):
    Observable<{data: TelemetryModel, succeess: boolean}> {
        return this.http.put<{data: TelemetryModel, succeess: boolean}>
        (`${environment.apiUrl}/api/v1/telemetry/${webApiId}/reinitiate`, updateObject);
    }

  
}

