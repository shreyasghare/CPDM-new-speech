import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageContentDataModel } from '@cpdm-model/admin/imageContentData.model';
import { RecommendationDataModel } from '@cpdm-model/admin/recommendationData.model';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class EditDetailsAdminService {
    constructor(private http: HttpClient) { }

    private adminEditDataSource = new Subject<any>();
    adminEditDataSub = this.adminEditDataSource.asObservable();

    // to update data from parent menu
    updateAdminEditData(data: any) {
        this.adminEditDataSource.next(data);
    }

    // to get stackbale sidebar
    getStackableSidebarData(): Observable<{success: boolean, data: [{ heading: string, menuStack: [{ menu, subMenu }]}]}> {
        return this.http.get<{success: boolean, data: [{ heading: string, menuStack: [{ menu, subMenu }]}]}>
                                    (`${environment.apiUrl}/api/v1/admin/stackableMultilevelStepsSideBar`);
    }
    /**
     * Api call to get image & content data for overview
     */
    getImageContentDataForOverview(workflowName: string, workflowTitle: string):
                    Observable<{ success: boolean, metaData: { path: string }, data }> {
        return this.http.get<{ success: boolean, metaData: { path: string }, data }>
        (`${environment.apiUrl}/api/v1/admin/overview/${workflowName}/${workflowTitle}`);
    }

    /**
     * Api call to get image & content data for information helper
     */
    // TODO : Change type 'any'
    getImageContentDataForInfoHelper(workflowName: string, stepName: string, modalSize: string):
                    Observable<{ success: boolean, metaData: { path: string }, data }> {
        return this.http.get<{ success: boolean, metaData: { path: string }, data }>
            (`${environment.apiUrl}/api/v1/admin/informationHelper?workflow=${workflowName}&&name=${stepName}&&modalSize=${modalSize}`);
    }

    /**
     * To get image content data for TBP recommendations 
     */
    getImageContentDataForRecommendation(workflowName: string, subMenuTitle: string):
                    Observable<{ success: boolean, metaData: { path: string }, data:ImageContentDataModel[] }> {
        return this.http.get<{ success: boolean, metaData: { path: string }, data }>
            (`${environment.apiUrl}/api/v1/admin/recommendations/${workflowName}/${subMenuTitle}`);
    }
    /**
     * To get live or draft TBP recommendation data
     */
    getVersionBasedRecommendationData(version: string):
                Observable<{success: boolean, data:RecommendationDataModel}> {
            const params = new HttpParams().set('version', version)
        return this.http.get<{success: boolean, data:RecommendationDataModel}>
                    (`${environment.apiUrl}/api/v1/admin/serviceabilityRecommendations?${params.toString()}`);
    }
    /**
     * To save recommendations draft data
     */
    saveRecommendationsDraftData(data: RecommendationDataModel):
        Observable<{success: boolean, data:RecommendationDataModel}>{
            return this.http.put<{ success: boolean, data:RecommendationDataModel }>(`${environment.apiUrl}/api/v1/admin/serviceabilityRecommendations/draft`, data);
    }
    /**
     * To publish Drafted data
     * @param version
     * @returns 
     */
    publishDraftedData(version: {version: string}):
        Observable<{success: boolean, data:{success: string}}> {
            return this.http.post<{success: boolean, data:{success: string}}>(`${environment.apiUrl}/api/v1/admin/serviceabilityRecommendations/publish`, version)
    }

    /**
     * Api call to update editor content
     */
    updateModalContent(modalName: string, body: { id: string, desc: string }): Observable<{ success: boolean, data }> {
        return this.http.put<{ success: boolean, data }>(`${environment.apiUrl}/api/v1/admin/${modalName}`, body);
    }
}
