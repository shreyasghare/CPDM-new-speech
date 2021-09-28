import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs/Subject';
import { StartApiProductsWorkflow } from '@cpdm-model/technology-best-practices/api-products/startApiProductsWorkflow.model';
import { StartTelemetryWorkflowModel } from '@cpdm-model/technology-best-practices/telemetry/startTelemetryWorkflow.model';
import { IPv6Model } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { StartServiceabilityWorkflowModel } from '@cpdm-model/technology-best-practices/serviceability/startServiceabilityWorkflow.model';
import { StartCSDLWorkflowModel } from '@cpdm-model/general-compliances/csdl/startCSDLWorkflow.model';
import { StartTpsdWorkflowModel } from '@cpdm-model/general-compliances/tpsd/startTpsdWorkflow.model';
import { StartExportComplianceWorkflowModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';
import { StartCRCWorkflowModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { GlobalizationModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
@Injectable({
    providedIn: 'root'
})

export class ProjectsDetailService {
    projectDetails: any;
    private complianceIndexChanged = new Subject<any>();
    notifyCompliancetabIndex = this.complianceIndexChanged.asObservable();
    selectedTabValue: {projectId: string, tabIndex: number };

    constructor(private http: HttpClient) { }

    setProjectDetails(projectDetails: any) {
        if (projectDetails.complianceItems.length > 0) {
            projectDetails.complianceItems.forEach(element => { element.complianceType = 'general'; });
        }
        if (projectDetails.additionalRequirements.length > 0) {
            projectDetails.additionalRequirements.forEach(element => { element.complianceType = 'additional'; });
        }
        if (projectDetails.technicalStandardItems.length > 0) {
            projectDetails.technicalStandardItems.forEach(element => { element.complianceType = 'technicalStandard'; });
        }

        this.projectDetails = projectDetails;
    }

    get getProjectDetails(): any {
        return this.projectDetails;
    }


    // update Project Acceptor or Owner
    updateAcceptorOwner(projectAcceptorOwner: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/projectNFR/editAcceptorOwner`, projectAcceptorOwner);
    }

    // update Project Acceptor or Owner
    updateAssignedToUsers(assignedUserDetails: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/projectNFR/updateAssignedTo`, assignedUserDetails);
    }

    // update Compliance Item Status
    updateComplianceItemStatus(complianceItem: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/projectNFR/complianceStatus`, complianceItem);
    }
    // update Compliance Item comment
    updateComplianceItemComment(complianceItem: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/projectNFR/addComments`, complianceItem);
    }

    manageCompliance(complianceItem: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/api/v1/projectNFR/manageCompliance`, complianceItem);
    }

    getAllComplianceItem(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/api/v1/projectNFR/NFRItemList`);
    }

    readComments(obj): Observable<any> {
        return this.http.put(`${environment.apiUrl}/api/v1/projectNFR/readComments`, obj);
    }

    // to get content for generalCompliance HelpOverlay
    getGeneralComplianceHelpOverlay(complianceType) {
        return this.http.get<any[]>(`${environment.apiUrl}/api/v1/projectNFR/${complianceType}/help`);
    }

    selectedComplianceTabIndex(data: {selectedTabIndex: number}) {
        if (data) {
            this.selectedTabValue = {
                projectId: this.projectDetails._id,
                tabIndex : data.selectedTabIndex
            };
            this.complianceIndexChanged.next(data);
        } else {
            this.complianceIndexChanged.next({selectedTabIndex:  0});
        }
    }

    startApiProductsProcess(projectId: string, technicalStandardItemId: string,betaFlag:boolean): Observable<StartApiProductsWorkflow> {
        const body = { projectId, technicalStandardItemId, betaFlag };
        return this.http.post<StartApiProductsWorkflow>(`${environment.apiUrl}/api/v1/api-products`, body);
    }
    startIPv6Process(projectId: string,betaFlag:boolean): Observable<{success: boolean, data: IPv6Model}> {
        const body = { projectId, betaFlag };
        return this.http.post<{success: boolean, data: IPv6Model}>(`${environment.apiUrl}/api/v1/ipv6`, body);
    }
    startTelemetryWorkflow(projectId: string, technicalStandardItemId: string,betaFlag:boolean): Observable<StartTelemetryWorkflowModel> {
        const body = { projectId, technicalStandardItemId,betaFlag };
        return this.http.post<StartTelemetryWorkflowModel>(`${environment.apiUrl}/api/v1/telemetry`, body);
    }
    startServiceabilityProcess(projectId: string, betaFlag: boolean, header?: any): Observable<StartServiceabilityWorkflowModel> {
        const body = { projectId, betaFlag };
        return this.http.post<StartServiceabilityWorkflowModel>(`${environment.apiUrl}/api/v1/serviceability`, body);
    }
    startCSDLProcess(projectId: string, generalComplianceItemId: string, betaFlag: boolean): Observable<StartCSDLWorkflowModel> {
        const body = { projectId, generalComplianceItemId, betaFlag };
        return this.http.post<StartCSDLWorkflowModel>(`${environment.apiUrl}/api/v1/csdl`, body);
    }
    startTpsdProcess(projectId: string, generalComplianceItemId: string, betaFlag: boolean): Observable<StartTpsdWorkflowModel> {
        const body = { projectId, generalComplianceItemId, betaFlag };
        return this.http.post<StartTpsdWorkflowModel>(`${environment.apiUrl}/api/v1/tpsd`, body);
    }
    startExportComplianceProcess(projectId: string, generalComplianceItemId: string, betaFlag: boolean) {
        const body = { projectId, generalComplianceItemId, betaFlag };
        return this.http.post<StartExportComplianceWorkflowModel>(`${environment.apiUrl}/api/v1/exportCompliance`, body);
    }
    startCRCProcess(projectId: string, betaFlag: boolean) {
        const body = { projectId, betaFlag };
        return this.http.post<StartCRCWorkflowModel>(`${environment.apiUrl}/api/v1/communicationsRegulatory`, body);
    }
    startGlobalizationProcess(projectId: string, betaFlag: boolean) {
        const body = { projectId, betaFlag };
        return this.http.post<GlobalizationModel>(`${environment.apiUrl}/api/v1/globalization/start`, body);
    }
}