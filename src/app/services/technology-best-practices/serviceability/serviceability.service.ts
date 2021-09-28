import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServiceabilityModel, SavedFilters } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';
import { ServiceabilityRecModel } from '@cpdm-model/technology-best-practices/serviceability/serviceabilityRecommendation.model';

@Injectable()
export class ServiceabilityService {
  private serviceabilityId: string = null;
  constructor(private http: HttpClient) { }

  private serviceabilityDataSource = new BehaviorSubject<ServiceabilityModel>(null);
  getServiceabilityDataSub = this.serviceabilityDataSource.asObservable();
  updateServiceabilityData(serviceabilityData: ServiceabilityModel) {
    this.serviceabilityDataSource.next(serviceabilityData);
  }

  get ServiceabilityId(): string {
    return this.serviceabilityId;
  }

  setServiceabilityId(objectId: string) {
    this.serviceabilityId = objectId;
  }

  /**
   * Service call to get ' Serviceability ' data
   */
  getServiceabilityData(serviceabilityId: string): Observable<{ success: boolean, data: ServiceabilityModel }> {
    return this.http.get<{ success: boolean, data: ServiceabilityModel }>
    (`${environment.apiUrl}/api/v1/serviceability/${serviceabilityId}`);
  }

  /**
   * Service call to update ' Serviceability ' object
   */
  updateServiceabilityObject(serviceabilityID: string, updateObject: any):
  Observable<{ success: boolean, data: ServiceabilityModel }> {
    return this.http.put<{ success: boolean, data: ServiceabilityModel }>
    (`${environment.apiUrl}/api/v1/serviceability/${serviceabilityID}`, updateObject);
  }

  /**
   * Service call to get Recommendation data
   */
  getServiceabilityRecommendationData(serviceabilityId: string): Observable<{ success: boolean, data: ServiceabilityRecModel }> {
    return this.http.get<{ success: boolean, data: ServiceabilityRecModel }>
            (`${environment.apiUrl}/api/v1/serviceability/${serviceabilityId}/recommendations`);
  }

  /**
   * @description Update saved filters for Serviceability
   * @param ServiceabilityId is an unique id for Serviceability Details
   * @param savedFilters is a collection of filters user applied on recommendation details
   */
  updateSavedFiltersData(serviceabilityId: string, savedFilters: {'savedFilters': SavedFilters}): Observable<{success: boolean, data: SavedFilters}> {
    return this.http.put<{success: boolean, data: SavedFilters}>(`${environment.apiUrl}/api/v1/serviceability/${serviceabilityId}/recommendations/filters`, savedFilters);
  }

  /**
   * Populate Jira & rally backlog
   * @param body
   */
  populateBacklog(body: {selectedRepo: string, userId: string, rallyProjectId: string, _id: string, selectedWS: string, projectId: string}): Observable<{data: ServiceabilityModel}> {
    return this.http.post<{data: ServiceabilityModel}>(`${environment.apiUrl}/api/v1/serviceability/${body.selectedRepo}/backlog`, body);
  }

  /**
  * Updating data for manual implementation method
  * @param serviceability
  */
  registerManualImplementation(serviceabilityId: { serviceabilityId: string }): Observable<{success: boolean, data: ServiceabilityModel}> {
    return this.http.put<{success: boolean, data: ServiceabilityModel}>(`${environment.apiUrl}/api/v1/serviceability/implementation/manual`, serviceabilityId);
  }

  /**
   * To update recommendations
   * @param body
   */
  updateRecommendation(id: string, body): Observable<{ success: boolean, data: ServiceabilityModel }> {
    return this.http.put<{ success: boolean, data: ServiceabilityModel }>(`${environment.apiUrl}/api/v1/serviceability/${id}`, body);
  }

  //----------  US9997: Serviceability: Re-initiate functionality  ----------
  reinitiate(id: string, body: {workflow: { active: string, next: string }}): Observable<{ success: boolean, data: ServiceabilityModel }> {
    return this.http.put<{ success: boolean, data: ServiceabilityModel }>(`${environment.apiUrl}/api/v1/serviceability/${id}/reinitiate`, body);
  }
}
