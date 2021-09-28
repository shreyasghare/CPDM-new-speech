import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CmtToolUrlModel, ExportComplianceAssignModel, ExportComplianceModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportComplianceService {
  private exportComplianceDataSource$ = new BehaviorSubject<ExportComplianceModel>(null);
  getExportComplianceDataSub = this.exportComplianceDataSource$.asObservable();

  private cmtToolUrlDataSource$ = new BehaviorSubject<CmtToolUrlModel>(null);
  getCMTToolUrlDataSub = this.cmtToolUrlDataSource$.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * @description service to get Export Compliance data
   */
  getExportComplianceData(exportComplianceId: string): Observable<{ success: boolean, data: ExportComplianceModel }> {
    return this.http.get<{ success: boolean, data: ExportComplianceModel }>(`${environment.apiUrl}/api/v1/exportCompliance/${exportComplianceId}`);
  }

  /**
   * @description BehaviorSubject service to update TPSD data
   * @param exportComplianceData
   */
  updateEcDataWithSubject(exportComplianceData: ExportComplianceModel) {
    this.exportComplianceDataSource$.next(exportComplianceData);
  }

  /**
   * @description Subject service to get CMT Tool url
   * @param url CMT Tool redirect url
   */
  updateCMTToolUrlDataSource(url: CmtToolUrlModel) {
    this.cmtToolUrlDataSource$.next(url);
  }

  /**
   * @description Confirms existing EPR project details
   * @param exportComplianceId
   * @param body
   */
  linkEprProjectData(exportComplianceId: string, body: {}): Observable<{ success: boolean, data: ExportComplianceModel }> {
    return this.http.put<{ success: boolean, data: ExportComplianceModel }>(`${environment.apiUrl}/api/v1/exportCompliance/link/${exportComplianceId}`, body);
  }

  /**
   * @description Get Export Compliance assigned data
   * @param exportComplianceId Export Compliance Id
   * @returns { success: boolean, data: ExportComplianceAssignModel }
   */
  getExportComplianceAssignedData(exportComplianceId: string): Observable<{ success: boolean, data: ExportComplianceAssignModel }> {
    return this.http.get<{ success: boolean, data: ExportComplianceAssignModel }>(`${environment.apiUrl}/api/v1/exportCompliance/assign/${exportComplianceId}`);
  }

  /**
   * @description Get CMT Tool URL to generate new EPR ID
   * @returns { success: boolean, data: { cmtUrl: string } }
   */
  getCMTToolURL(): Observable<{ success: boolean, data: CmtToolUrlModel }> {
    return this.http.get<{ success: boolean, data: CmtToolUrlModel }>(`${environment.apiUrl}/api/v1/exportCompliance/cmtToolUrl`);
  }

  /**
   * @description Get Export Compliance assigned data
   * @param exportComplianceId Export Compliance Id
   * @returns { success: boolean, data: ExportComplianceAssignModel }
   */
  updateExportComplianceObject(ecId: string, body): Observable<{ success: boolean, data: ExportComplianceModel }> {
    return this.http.put<{ success: boolean, data: ExportComplianceModel }>(`${environment.apiUrl}/api/v1/exportCompliance/${ecId}`, body);
  }

  /**
   * @description Get Export Compliance assigned data
   * @param exportComplianceId Export Compliance Id
   * @returns { success: boolean, data: ExportComplianceAssignModel }
   */
  updateEprId(ecId: string, body): Observable<{ success: boolean, data: ExportComplianceModel }> {
    return this.http.put<{ success: boolean, data: ExportComplianceModel }>(`${environment.apiUrl}/api/v1/exportCompliance/updateEprId/${ecId}`, body);
  }
 }
