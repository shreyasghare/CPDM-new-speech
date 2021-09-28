import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPv6Model, Recommendation, SavedFilters } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { IPv6FilterTableModel } from '@cpdm-model/technology-best-practices/ipv6/ipv6FilterTable.model';
import { IPv6RecommendationModel } from '@cpdm-model/technology-best-practices/ipv6/ipv6Recommendation.model';

@Injectable({
    providedIn: 'root'
})
export class IPv6Service {
    private IPv6DetailsSubject = new BehaviorSubject<IPv6Model>(null);
    getIPv6DetailsSubject = this.IPv6DetailsSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * @description Set updated IPv6 details to local data source
     * @param IPv6Data contains IPv6 details
     */
    updateIPv6DetailsSubject(IPv6Data: IPv6Model) {
        this.IPv6DetailsSubject.next(IPv6Data);
    }

    /**
     * @description Fetching IPv6 Details from db
     * @param IPv6Id is an unique id for IPv6 Details
     */
    getIPv6Details(IPv6Id: string): Observable<{ success: boolean, data: IPv6Model }> {
        return this.http.get<{ success: boolean, data: IPv6Model }>(`${environment.apiUrl}/api/v1/ipv6/${IPv6Id}`);
    }

    /**
     * @description Fetching filter data for IPv6
     * @param IPv6Id is an unique id for IPv6 Details
     */
    getIPv6FilterTableData(IPv6Id: string): Observable<{ success: boolean, data: IPv6FilterTableModel }> {
        return this.http.get<{ success: boolean, data: IPv6FilterTableModel }>
            (`${environment.apiUrl}/api/v1/ipv6/${IPv6Id}/recommendations/filters`);
    }

    /**
     * @description Update saved filters for IPv6
     * @param IPv6Id is an unique id for IPv6 Details
     * @param savedFilters is a collection of filters user applied on recommendation details
     */
    updateSavedFiltersData(IPv6Id: string, savedFilters: {'savedFilters': SavedFilters}): Observable<{success: boolean, data: SavedFilters}> {
        return this.http.post<{success: boolean, data: SavedFilters}>(`${environment.apiUrl}/api/v1/ipv6/${IPv6Id}/recommendations/filters`, savedFilters);
    }

    /**
     * @description Fetching IPv6 recommendations details
     * @param IPv6Id is an unique id for IPv6 Details
     */
    getIPv6Recommendations(IPv6Id: string): Observable<{ success: boolean, data: IPv6RecommendationModel }> {
        return this.http.get<{ success: boolean, data: IPv6RecommendationModel }>
            (`${environment.apiUrl}/api/v1/ipv6/${IPv6Id}/recommendations`);
    }

    // to register manual implementation details
    registerManualImplementation(ipv6Id: { ipv6Id: string }): Observable<{ success: boolean, data: IPv6Model }> {
        return this.http.put<{ success: boolean, data: IPv6Model }>(`${environment.apiUrl}/api/v1/ipv6/implementation/manual`, ipv6Id);
    }

    // to populate backlog
    populateBacklog(body: { selectedRepo: string, userId: string, rallyProjectId: string, _id: string, selectedWS: string, projectId: string }): Observable<{ success: boolean, data: IPv6Model }> {
        return this.http.post<{ success: boolean, data: IPv6Model }>(`${environment.apiUrl}/api/v1/ipv6/${body.selectedRepo}/backlog`, body);
    }

    reinitiate(id: string, body: {workflow: { active: string, next: string }}): Observable<{ success: boolean, data: IPv6Model }> {
        return this.http.put<{ success: boolean, data: IPv6Model }>(`${environment.apiUrl}/api/v1/ipv6/${id}/reinitiate`, body);
    }

    update(id: string, body): Observable<{ success: boolean, data: IPv6Model }> {
    return this.http.put<{ success: boolean, data: IPv6Model }>(`${environment.apiUrl}/api/v1/ipv6/${id}`, body);
  }
}
