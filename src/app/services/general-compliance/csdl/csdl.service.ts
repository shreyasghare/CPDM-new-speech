import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { CsdlModel, CsdlProjectModel, CsdlPlanExecuteModel, CsdlCreateNewProjectModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class CsdlService {
  private csdlID: string = null;
  private csdlDataSource = new BehaviorSubject<CsdlModel>(null);
  getCsdlDataSub = this.csdlDataSource.asObservable();
  private csdlPlanDataFromSi: CsdlPlanExecuteModel;

  constructor(private http: HttpClient) { }

  get csdlPlanData(): CsdlPlanExecuteModel {
    return this.csdlPlanDataFromSi;
  }

  setCsdlPlanData(data: CsdlPlanExecuteModel) {
    this.csdlPlanDataFromSi = data;
  }

  updateCsdlData(csdlData: CsdlModel) {
    this.csdlDataSource.next(csdlData);
  }

  // To switch from 'Complete' step to 'Pan_Execute' Step --- start
  private switchToStepSubject = new Subject<string>();

  switchToStepEvent(stepName: string) {
    this.switchToStepSubject.next(stepName);
  }

  getSwitchToStepEvent$(): Observable<string> {
    return this.switchToStepSubject.asObservable();
  }
  // To switch from 'Complete' step to 'Pan_Execute' Step --- end

  get CsdlID(): string {
    return this.csdlID;
  }

  setCsdlID(objectId: string) {
    this.csdlID = objectId;
  }
  /**
   * Service call to get ' CSDL ' data
   */
  getCsdlData(csdlID: string): Observable<{ success: boolean, data: CsdlModel }> {
    return this.http.get<{ success: boolean, data: CsdlModel }>
    (`${environment.apiUrl}/api/v1/csdl/${csdlID}`);
  }

  /**
   * Service call to update ' CSDL ' object
   */
  updateCsdlObject(csdlID: string, updateObject: any): Observable<{ success: boolean, data: CsdlModel }> {
    return this.http.put<{ success: boolean, data: CsdlModel }>(`${environment.apiUrl}/api/v1/csdl/${csdlID}`, updateObject);
  }

  /**
   * to get csdl data for plan-execute step
  */
 getCsdlPlanExecuteDataFromSi(csdlId: string, csdlProjectId: string, fetchType: string): Observable<{ success: boolean, data: CsdlPlanExecuteModel}> {
   return this.http.get<{ success: boolean, data: CsdlPlanExecuteModel }>
              (`${environment.apiUrl}/api/v1/csdl/${csdlId}/${csdlProjectId}?fetch=${fetchType}`);
 }
  /**
   * @description Get existing project details by CSDL ID
   * @param csdlProjectId
  */
  getProjectDetailsByCsdlId(csdlProjectId: string): Observable<{ success: boolean, data: CsdlProjectModel }> {
    return this.http.get<{ success: boolean, data: CsdlProjectModel }>(`${environment.apiUrl}/api/v1/csdl/${this.CsdlID}/${csdlProjectId}?fetch=basic`);
  }

  /**
   * @description Confirms existing project details
   * @param csdlID
   * @param body
   */
  confirmProjectDetails(csdlID: string, body: {csdlProjectId: number}): Observable<{ success: boolean, data: CsdlModel }> {
    return this.http.put<{ success: boolean, data: CsdlModel }>(`${environment.apiUrl}/api/v1/csdl/${csdlID}`, body);
  }

  /**
   * @description Updates/Reinitiates CSDL
   * @param csdlId
   * @param updateObject
   */
  updateCSDL(csdlId: string, updateObject: {workflow: { active: string, next: string }}): Observable<{success: boolean, data: CsdlModel}> {
      return this.http.put<{success: boolean, data: CsdlModel}>(`${environment.apiUrl}/api/v1/csdl/${csdlId}/reinitiate`, updateObject);
  }

  /**
   * @description get list of Business Entity // Sub Business Entity // Product Family
   */
  getBeSbePfList(): Observable<{sucess: boolean, data: {label: string, value: string}[]}> {
    return this.http.get<{sucess: boolean, data: {label: string, value: string}[]}>(`${environment.apiUrl}/api/v1/csdl/be-sbe-pf`);
  }

  /**
   * @description Create new CSDL project and links id
   * @param requestObj
   */
  createCSDLProject(requestObj: CsdlCreateNewProjectModel): Observable<{success: boolean, data: CsdlModel}> {
    return this.http.post<{success: boolean, data: CsdlModel}>(`${environment.apiUrl}/api/v1/csdl/create`, requestObj);
  }
}


