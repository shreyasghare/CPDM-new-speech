import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Models
 */
import { WebPlanFilterTableModel } from '@cpdm-model/technology-best-practices/web-api/webPlanFilterTable.model';
import { WebRecommendationModel, Recommendation } from '@cpdm-model/technology-best-practices/web-api/webRecommendation.model';
import { WebApiModel } from '@cpdm-model/technology-best-practices/web-api/webApiModel.model';
import { FilterCriteriaModel, FiltersModel } from '@cpdm-model/technology-best-practices/web-api/filterCriteria.model';
import { UpdateResponseWebRecommendationModel } from '@cpdm-model/technology-best-practices/web-api/updateResponseWebRecommendation.model';

@Injectable()
export class WebApiService {
    private _webApiId: string = null;

    constructor(private http: HttpClient) { }

    private webApiDataSource = new BehaviorSubject<WebApiModel>(null);
    getWebApiDataSub = this.webApiDataSource.asObservable();


    updateWebApiData(webApiData: WebApiModel) {
        this.webApiDataSource.next(webApiData);
    }

    // Call to api to get all the recommendation filters in filter table of ' plan ' step
    getWebPlanFilterTableData(webApiID: string): Observable<{ success: boolean, data: WebPlanFilterTableModel }> {
        return this.http.get<{ success: boolean,
        data: WebPlanFilterTableModel }>(`${environment.apiUrl}/api/v1/api-products/${webApiID}/recommendation/filter`);
    }

    // Call to api to get web recommendation
    getWebRecommendationData(webApiID: string, filterCriteria: FilterCriteriaModel = null, virtualScrollObj: VirtualScroll):
     Observable<{ success: boolean, data: WebRecommendationModel }> {
        return this.http.post<{ success: boolean, data: WebRecommendationModel }>
        (`${environment.apiUrl}/api/v1/api-products/${webApiID}/recommendation`,
        this.getBody(virtualScrollObj, filterCriteria));
    }

    // Please ignore typecasting for now
    getWebRecommendationDataAndShowProgress(
        webApiID: string, filterCriteria: FilterCriteriaModel = null,
        virtualScrollObj: { limit: number, skip: number }): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/api/v1/api-products/${webApiID}/recommendation`,
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

    get webApiId(): string {
        return this._webApiId;
    }

    setWebApiId(objectId: string) {
        this._webApiId = objectId;
    }

    /**
    * Get api-products details
    * @param webApiId
    */
    getWebApiData(webApiId: string): Observable<{success: boolean, data: WebApiModel}> {
        return this.http.get<{success: boolean, data: WebApiModel}>(`${environment.apiUrl}/api/v1/api-products/${webApiId}`);
    }

    /**
    * Updating data for manual implementation method
    * @param webApiId
    */
    registerManualImplementation(webApiId: { webApiId: string }): Observable<{success: boolean,
        data: WebApiModel}> {
        return this.http.post<{success: boolean, data: WebApiModel}>
        (`${environment.apiUrl}/api/v1/api-products/implementation/manual`, webApiId);
    }

    /**
     * Populate Jira & rally backlog
     * @param body
     */
    populateBacklog(
        body: {selectedRepo: string, userId: string,
        rallyProjectId: string, webApiId: string, selectedWS: string, projectId: string}): Observable<{data: WebApiModel}> {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('timeout', '300000');
        return this.http.post<{data: WebApiModel}>(`${environment.apiUrl}/api/v1/api-products/${body.selectedRepo}/backlog`, body, {headers});
    }

    /**
     * Update web recommendation
     */
    updateWebApiObject(webApiID: string, updateObject: any): Observable<{success: boolean, data: WebApiModel}> {
        return this.http.put<{success: boolean, data: WebApiModel}>(`${environment.apiUrl}/api/v1/api-products/${webApiID}`, updateObject);
    }

    // Update table modal data
    updateRecommendation(webApiID: string, updateObject: ObjectType):
    Observable<{success: boolean, data: UpdateResponseWebRecommendationModel}> {
        return this.http.put<{success: boolean,
            data: UpdateResponseWebRecommendationModel}>(`${environment.apiUrl}/api/v1/api-products/${webApiID}/recommendation`, updateObject);
    }

    // to reinitiate the workflow
    reinitiateWebApi(webApiId: string, updateObject: {workflow: { active: string, next: string }}):
    Observable<{success: boolean, data: WebApiModel}> {
        return this.http.put<{success: boolean, data: WebApiModel}>
        (`${environment.apiUrl}/api/v1/api-products/${webApiId}/reinitiate`, updateObject);
    }
}

interface ObjectType { recommendations: Recommendation[]; }
interface RecommendationsBody { filters?: FiltersModel ; limit: number; skip: number; }
interface VirtualScroll { limit: number; skip: number; }
