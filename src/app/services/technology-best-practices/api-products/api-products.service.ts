import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ApiProductsModel } from '@cpdm-model/technology-best-practices/api-products/apiProducts.model';
import { ApiProductsPlanFilterTableModel } from '@cpdm-model/technology-best-practices/api-products/apiProductsPlanFilterTable.model';
import { Recommendation, ApiProductsRecommendationModel } from '@cpdm-model/technology-best-practices/api-products/apiProductsRecommendation.model';
import { UpdateResApiProductsRecommendationModel } from '@cpdm-model/technology-best-practices/api-products/updateResApiProductsRecommendation.model';
import { FilterCriteriaModel, FiltersModel } from '@cpdm-model/technology-best-practices/api-products/filterCriteria.model';

@Injectable({
  providedIn: 'root'
})
export class ApiProductsService { 
  private _apiProductsId: string = null;

  constructor(private http: HttpClient) { }

  private apiProductsDataSource = new BehaviorSubject<ApiProductsModel>(null);
  getApiProductsDataSub = this.apiProductsDataSource.asObservable();


  updateApiProductsData(apiProductsData: ApiProductsModel) {
      this.apiProductsDataSource.next(apiProductsData);
  }
  
  // Call to api to get all the recommendation filters in filter table of 'plan' step
  getApiProductsPlanFilterTableData(apiProductsId: string): Observable<{ success: boolean, data: ApiProductsPlanFilterTableModel }> {
      return this.http.get<{ success: boolean,
      data: ApiProductsPlanFilterTableModel }>(`${environment.apiUrl}/api/v1/api-products/${apiProductsId}/recommendation/filter`);
  }

  // Call to api to get api-products recommendations
  getApiProductsRecommendationData(apiProductsId: string, filterCriteria: FilterCriteriaModel = null, virtualScrollObj: VirtualScroll):
    Observable<{ success: boolean, data: ApiProductsRecommendationModel }> {
      return this.http.post<{ success: boolean, data: ApiProductsRecommendationModel }>
      (`${environment.apiUrl}/api/v1/api-products/${apiProductsId}/recommendation`,
      this.getBody(virtualScrollObj, filterCriteria));
  }

  // Please ignore typecasting for now
  getApiProductsRecommendationDataAndShowProgress(
    apiProductsId: string, filterCriteria: FilterCriteriaModel = null,
      virtualScrollObj: { limit: number, skip: number }): Observable<any> {
      return this.http.post<any>(`${environment.apiUrl}/api/v1/api-products/${apiProductsId}/recommendation`,
      this.getBody(virtualScrollObj, filterCriteria), { reportProgress: true,  observe: 'events' });
  }

  private getBody(virtualScrollObj: VirtualScroll, filterCriteria: FilterCriteriaModel):
  RecommendationsBody {
      const { limit, skip } = virtualScrollObj;
      const filters = filterCriteria ? filterCriteria.filters : null;
      const body: RecommendationsBody = { limit, skip };
      if (filters) {
       body.filters = filters;
      }
      return body;
  }

  get apiProductsId(): string {
      return this._apiProductsId;
  }

  setApiProductsId(objectId: string) {
      this._apiProductsId = objectId;
  }

  /**
  * Get api-products details
  * @param apiProductsId
  */
  getApiProductsData(apiProductsId: string): Observable<{success: boolean, data: ApiProductsModel}> {
      return this.http.get<{success: boolean, data: ApiProductsModel}>(`${environment.apiUrl}/api/v1/api-products/${apiProductsId}`);
  }

  /**
  * Updating data for manual implementation method
  * @param apiProductsId
  */
  registerManualImplementation(apiProductsId: { apiProductsId: string }): Observable<{success: boolean,
      data: ApiProductsModel}> {
      return this.http.post<{success: boolean, data: ApiProductsModel}>
      (`${environment.apiUrl}/api/v1/api-products/implementation/manual`, apiProductsId);
  }

  /**
   * Populate Jira & rally backlog
   * @param body
   */
  populateBacklog(
      body: {selectedRepo: string, userId: string,
      rallyProjectId: string, apiProductsId: string, selectedWS: string, projectId: string}): Observable<{data: ApiProductsModel}> {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('timeout', '300000');
      return this.http.post<{data: ApiProductsModel}>(`${environment.apiUrl}/api/v1/api-products/${body.selectedRepo}/backlog`, body, {headers});
  }

  /**
   * Update api-products recommendations
   */
  updateApiProductsObject(apiProductsId: string, updateObject: any): Observable<{success: boolean, data: ApiProductsModel}> {
      return this.http.put<{success: boolean, data: ApiProductsModel}>(`${environment.apiUrl}/api/v1/api-products/${apiProductsId}`, updateObject);
  }

  // Update table modal data
  updateRecommendation(apiProductsId: string, updateObject: ObjectType):
  Observable<{success: boolean, data: UpdateResApiProductsRecommendationModel}> {
      return this.http.put<{success: boolean,
          data: UpdateResApiProductsRecommendationModel}>(`${environment.apiUrl}/api/v1/api-products/${apiProductsId}/recommendation`, updateObject);
  }

  // to reinitiate the workflow
  reinitiateApiProducts(apiProductsId: string, updateObject: {workflow: { active: string, next: string }}):
  Observable<{success: boolean, data: ApiProductsModel}> {
      return this.http.put<{success: boolean, data: ApiProductsModel}>
      (`${environment.apiUrl}/api/v1/api-products/${apiProductsId}/reinitiate`, updateObject);
  }
}

interface ObjectType { recommendations: Recommendation[]; }
interface RecommendationsBody { filters?: FiltersModel ; limit: number; skip: number; }
interface VirtualScroll { limit: number; skip: number; }