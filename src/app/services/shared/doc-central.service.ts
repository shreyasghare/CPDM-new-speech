import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectsDetailService } from '../project/project-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { saveAs } from 'file-saver';
import { DocCentral } from '@cpdm-model/DocCentral';
import { DocCentralPostBody } from '@cpdm-model/docCentralPostBody.model';
import { user } from '@cpdm-model/user';
import { DocCentralPermission } from '@cpdm-model/DocCentralPermission';
import { DocCentralUpdateReq } from '@cpdm-model/docCentralUpdateReq';
import { DocCentralUpdateRes } from '@cpdm-model/docCentralUpdateRes';

@Injectable({
  providedIn: 'root'
})
export class DocCentralService {
  constructor(private http: HttpClient,
              private userDetailsService: UserDetailsService,
              private projectDetailsService: ProjectsDetailService,
              private toastService: ToastService) { }

  // ***************************Cisco Doc Central Services********************************************

  patchEdcsObj(projectId: string, body: any, header?): Observable<any> {
    if (header) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('user', JSON.stringify(header.user.userObj));
      headers = headers.append('adrProcess', header.adrProcess);
      return this.http.put(`${environment.apiUrl}/api/v1/accessibility/edcs/${projectId}`, body, {headers});
    }
    return this.http.put(`${environment.apiUrl}/api/v1/accessibility/edcs/${projectId}`, body);
  }

   // Doc central version control---------------------------------------------------------------
  updateFileToDocCentral(file: File, body: DocCentralUpdateReq, projectId: string): Observable<DocCentralUpdateRes> {
    const postData = new FormData();

    postData.append('file', file);

    if (status) { postData.append('status', status); }

    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        postData.append(key, body[key]);
      }
    }

    return this.http.post<DocCentralUpdateRes>(`${environment.apiUrl}/api/v1/doccentral/document/update/${projectId}`, postData);
  }

  // Service to upload any file to doc central-------------------------------------------------------
  docCentralUpload(file: File, body: DocCentralPostBody, revRecId = null): Observable<DocCentralResponse> {
    const postData = new FormData();
    const {
      title, description, folderPath,
      workflow = null, status = null,
      securityLevel  = null, docType = null,
      projectId = null
    } = body;

    postData.append('title', title);
    postData.append('description', description);
    postData.append('permissions', this.generateDocCentralPermissionArray());
    postData.append('folderPath', folderPath);
    postData.append('file', file);
    postData.append('revRecId', revRecId);

    if (workflow) { postData.append('workflow', workflow); }
    if (status) { postData.append('status', status); }
    if (securityLevel) { postData.append('securityLevel', securityLevel); }
    if (docType) { postData.append('docType', docType); }
    if (projectId) { postData.append('projectId', projectId); }

    return this.http.post<DocCentralResponse>(`${environment.apiUrl}/api/v1/doccentral/`, postData);
  }

  // Generate and upload excel file in doc central for adr list approval PM PO------------------------
  docCentralGenerateUpload(projectId: string, body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/excel/generate/doccentral/${projectId}`, body);
  }

  // Doc central download blob file
  downloadFromDocCentral(nodeRef: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/doccentral/?path=${nodeRef}`, {responseType: 'blob'});
  }

  generateDocCentralPermissionArray(): string {
    const owners = this.projectDetailsService.projectDetails.owners;
    const teams = this.projectDetailsService.projectDetails.teams;
    const permissions = [] as DocCentralPermission[];
    const loggedInUser =  this.userDetailsService.getLoggedInCecId();

    const generatePemissionsArray = (array: [user]) => {
      type validPermission = 'owner' | 'reader';

      const pushToPermissions = (cecId: string, permission: validPermission) => {
        const isUserExists = permissions ? permissions.some( user => user.authority === cecId ) : false;
        if (!isUserExists) { permissions.push({authority: `${cecId}`, permission}); }
      };

      for (const item of array) {
        let permission: validPermission = 'reader';

        const { members, cecId } = item;

        if (cecId === loggedInUser) {
          permission = 'owner';
        }

        if (members && members.length > 0) {
          members.forEach( member => {
            pushToPermissions(member, permission);
          });
        } else {
          pushToPermissions(cecId, permission);
        }
      }
    };
    generatePemissionsArray(owners);
    generatePemissionsArray(teams);

    return JSON.stringify(permissions);
  }

  /**
   *
   * @param nodeRef Cisco Alfresco/Doc Central noderef/Stored file path
   * @param fileName Stored file file name or filename to save in local
   */
  downloadFileFromDocCentral(nodeRef: string, fileName: string) {
    return new Promise((resolve, reject) => {
      const toastGuid = this.toastService.showProgressBar('Download In Progress', fileName);
      this.http.get<any>(`${environment.apiUrl}/api/v1/doccentral/token`).subscribe(res => {
        if (res.success) {
          this.http.get(`${environment.docCentralAPI}/getDocument?param=${nodeRef}`, {responseType: 'blob', reportProgress: true,
          observe: 'events', headers: res.authToken})
          .subscribe((docCentralRes) => {
            const events = docCentralRes as {loaded: number, total: number};
            const httpResponse  = docCentralRes as HttpResponse<any>;
            this.toastService.updateProgressBar(toastGuid, Math.floor(events.loaded / events.total * 100), 'Download Success', fileName);
            if (httpResponse.body) {
              saveAs(httpResponse.body, fileName);
              resolve('file saved');
            }
          }, (err) => {
            this.toastService.update(toastGuid, 'Download Error', fileName, 'danger');
            reject(err);
          });
        }
      });
      });

  }

  private generateEdcsBody(edcsResBody: DocCentralResponse, fileName: string): DocCentral {
    const {edcsID, versionRef, nodeRef, _id} = edcsResBody;
    return  {
      _id,
      edcsID,
      versionRef,
      nodeRef,
      fileName,
      uploadDate: new Date().toString()
    };
  }


  /**
   *
   * @param file File to be uploded
   * @param edcsBody EDCS body for generating new EDCS link
   */
  // *******************************************************************************************
  uploadToDocCentralNew(file: File, edcsBody: DocCentralPostBody): Observable<{success: boolean, body: DocCentral}> {
    return new Observable((observer) => {
      observer.next({success: false, body: null});
      try {
        this.docCentralUpload(file, edcsBody).subscribe(docCentralRes => {
          if (docCentralRes._id) {
            observer.next({success: true, body: this.generateEdcsBody(docCentralRes, file.name)});
          } else {
            observer.error(docCentralRes.error);
          }
        }, err => {
          observer.error(err);
        }
        );
      } catch (error) {
        observer.error(error);
      }
    });
  }
  // *****************************************************************************************


  /**
   *
   * @param file File to Be Update
   * @param docCentralObj Existing EDCS Object
   */
  // *********************************************************************************
  updateToDocCentralNew(file: File, docCentralObj: DocCentral, projectId: string): Observable<any> {
    // Updating Existing EDCS Object*******************************************
    const edcsObj = JSON.parse(JSON.stringify(docCentralObj));
    edcsObj.fileName = file.name;
    edcsObj.uploadDate = new Date().toString();
    // ************************************************************************
    return new Observable((observer) => {
      observer.next({success: false, message: 'uploading', data: null});
      this.updateFileToDocCentral(file, edcsObj, projectId).subscribe(edcsRes => {
        const {versionRef, versionLabel, error, message } = edcsRes;
        if (message === 'Successfully checked in.') {
          observer.next({success: true, data: edcsObj, message: null});
        } else if (error) {
          observer.next({success: false, data: null, message: error});
        }
      }
      , (error) => {
        observer.error(error);
      });

    });
  }

  /**
 *
 * @param edcsId Pass any edcs id to download the approved document from EDCS UI
 */

downloadFromUI = (edcsId: string, version: 'approved' | 'latest') => {
  const aTag = document.createElement('a');
  aTag.rel = 'noopener noreferrer';
  aTag.target = '_blank';
  aTag.href = `${environment.docCentralLink}/share/proxy/alfresco/url?docnum=${edcsId}&ver=${version}`;
  aTag.click();
 }

 // ******************************************************************************

}

interface DocCentralResponse {
 nodeRef: string; edcsID: string; versionRef: string, error: string, _id: string
}
