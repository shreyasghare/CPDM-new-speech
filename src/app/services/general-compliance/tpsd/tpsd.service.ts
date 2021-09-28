import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TpsdModel, TpsdNewProduct, TpsdProductModel, TpsdProductRelease, TpsdRegisterExecuteModel, TpsdRegisterExecuteContent, CoronaAndTpsUrlModel } from '@cpdm-model/general-compliances/tpsd/tpsd.model';

@Injectable({
  providedIn: 'root'
})
export class TpsdService {
  private tpsdDataSource$ = new BehaviorSubject<TpsdModel>(null);
  getTpsdDataSub = this.tpsdDataSource$.asObservable();

  private tpsdReleaseDataSource$ = new BehaviorSubject<TpsdRegisterExecuteContent>(null);
  getTpsdReleaseDataSub = this.tpsdReleaseDataSource$.asObservable();

  private coronaAndTpsUrlDataSource$ = new BehaviorSubject<CoronaAndTpsUrlModel>(null);
  getCoronaAndTpsUrlDataSub = this.coronaAndTpsUrlDataSource$.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * @description service to get TPSD workflow data
   */
  getTpsdData(tpsdId: string): Observable<{ success: boolean, data: TpsdModel }> {
    return this.http.get<{ success: boolean, data: TpsdModel }>(`${environment.apiUrl}/api/v1/tpsd/${tpsdId}`);
  }

  /**
   * @description BehaviorSubject service to update TPSD data 
   */
  updateTpsdDataWithSubject(tpsdData: TpsdModel) {
    this.tpsdDataSource$.next(tpsdData);
  }

  /**
   * @description BehaviorSubject service to update TPSD release data 
   */
   updateTpsdReleaseDataWithSubject(tpsdReleaseData: TpsdRegisterExecuteContent) {
    this.tpsdReleaseDataSource$.next(tpsdReleaseData);
  }

  /**
   * @description Subject service to get Corona and Tps url
   * @param url Corona and TPS redirect url
   */
   updateCoronaTpsUrlDataSource(url: CoronaAndTpsUrlModel) {
    this.coronaAndTpsUrlDataSource$.next(url);
  }

  /**
   * @description service to update TPSD object
   */
  updateTpsdObject(tpsdId: string, updateObject: any): Observable<{ success: boolean, data: TpsdModel }> {
    return this.http.put<{ success: boolean, data: TpsdModel }>(`${environment.apiUrl}/api/v1/tpsd/${tpsdId}`, updateObject);
  }

  /**
   * @description Get all the Products
   * @param {string} name
   * @returns { success: boolean, data: string[] }
   */
  getAllProducts(projectName: string): Observable<{ success: boolean, data: string[] }> {
    return this.http.get<{ success: boolean, data: string[] }>(`${environment.apiUrl}/api/v1/tpsd/products?name=${projectName}`);
  }

  /**
   * @description Get all the releases for the selected product
   * @param {string} projectName
   * @returns { success: boolean, data: TpsdProductRelease }
   */
  getProductReleases(projectName: string): Observable<{ success: boolean, data: TpsdProductRelease }> {
    return this.http.get<{ success: boolean, data: TpsdProductRelease }>(`${environment.apiUrl}/api/v1/tpsd/product/release?name=${projectName}&page=0&size=50`);
  }

  /**
  * @description Create a new product
  * @param { string } tpsdId
  * @param { TpsdNewProduct } requestObj
  * @returns { success: boolean, data: TpsdProductModel }
  */
  createNewProduct(tpsdId: string, requestObj: TpsdNewProduct): Observable<{ success: boolean, data: TpsdProductModel }> {
    return this.http.put<{ success: boolean, data: TpsdProductModel }>(`${environment.apiUrl}/api/v1/tpsd/product/${tpsdId}`, requestObj);
  }

  /**
   * @description service to get DiscoverExecuteStepData
   * @param {string} tpsdId
   * @returns { success: boolean, data: TpsdRegisterExecuteModel }
   */
   getTpsdProjectReleaseData(tpsdId: string): Observable<{ success: boolean, data: TpsdRegisterExecuteModel }> {
    return this.http.get<{ success: boolean, data: TpsdRegisterExecuteModel }>(`${environment.apiUrl}/api/v1/tpsd/release/${tpsdId}`);
  }

  /**
  * @description Get corona and TPS URL to create new release and search exact product names
  * @returns { success: boolean, data: CoronaAndTpsUrlModel }
  */
  getCoronaAndTpsURL(): Observable<{ success: boolean, data: CoronaAndTpsUrlModel }> {
    return this.http.get<{ success: boolean, data: CoronaAndTpsUrlModel }>(`${environment.apiUrl}/api/v1/tpsd/corona/release`);
  }

}