import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TpsdService } from '@cpdm-service/general-compliance/tpsd/tpsd.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { TpsdModel, TpsdRegisterExecuteContent, TpsdProductReleaseContent, CoronaAndTpsUrlModel } from '@cpdm-model/general-compliances/tpsd/tpsd.model';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-tpsd-create-link',
  templateUrl: './tpsd-create-link.component.html',
  styleUrls: ['./tpsd-create-link.component.scss']
})
export class TpsdCreateLinkComponent implements OnInit, OnDestroy {
  caronaProductsList: string[];
  resProductRelease: TpsdProductReleaseContent[];
  csdlId: number;
  createTPSDForm = new FormGroup({
    isProductOnTpsEcosysSelect: new FormControl('', [Validators.required]),
    coronaProdName: new FormControl('', [this.noWhitespaceValidator]),
    isExistingOrNewReleaseSelect: new FormControl('', [Validators.required]),
    releasedVersionList: new FormControl('', [Validators.required]),
    releaseVersionText: new FormControl({value: '', disabled: true}, [this.noWhitespaceValidator]),
    csdlId: new FormControl({value: '', disabled: true})
  });
  showReleaseInfo = false;
  isReleaseVersionAvailable = true;
  isProjectLinked: boolean;
  isReinitiated: boolean;
  isReleaseDataRequested = false;
  isAllDetEntered = true;
  releasedVersion: string;
  extCoronaLink: string;
  tpsComplianceUrl: string;
  tpsComplianceProductUrl: string;
  selectedProductName: string;
  selectedVersionObject = {};
  destroy$ = new Subject();
  showLoader = true;
  loadingData = false;
  isNewlyLinked = false;
  tpsdProjectReleaseData: TpsdRegisterExecuteContent;
  tpsdDetails: TpsdModel;
  versionReleaseLength = false;
  tpsdId: string;
  constructor(private tpsdService: TpsdService,
              private toastService: ToastService,
              private userDetailsService: UserDetailsService,
              private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.tpsdId = this.activatedRoute.snapshot.parent.params.id;
    this.getTpsdDetails();
    this.formValueChanges();
    this.getCoronaUrl();
  }
  /**
   * @description Check for whitespace validation
   * @param { FormControl } control
   */
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getTpsdDetails() {
    this.tpsdService.getTpsdDataSub.pipe(takeUntil(this.destroy$)).subscribe(tpsdData => {
      if (tpsdData) {
        this.tpsdDetails = tpsdData;
        this.isProjectLinked = tpsdData.isProjectLinked;
        this.isReinitiated = tpsdData.isReinitiated;
        if (this.isProjectLinked || this.isReinitiated) {
          if (!this.isNewlyLinked) {
            this.tpsdService.getTpsdProjectReleaseData(this.tpsdDetails._id).pipe(takeUntil(this.destroy$)).subscribe(res => {
              if (res.data && res.data.content) {
                this.tpsdProjectReleaseData = res.data.content[0];
                this.patchFormData();
                if (!this.isReinitiated) {
                  this.disableFormControls();
                }
                this.showLoader = false;
                if (this.isReleaseVersionAvailable) {
                  this.showReleaseInfo = true;
                } else {
                  this.showReleaseInfo = false;
                }
              }
            }, () => {
              this.toastService.show('Error in data fetching', 'Error fetching TPSCRM details', 'danger');
            });
          } else {
            this.disableFormControls();
            this.showLoader = false;
          }
        } else {
          this.showLoader = false;
        }
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching TPSCRM details', 'danger');
    });
  }

  patchFormData() {
    const { productReleaseDetails: {isProductOnTps, isExistingRelease}} = this.tpsdDetails;
    this.createTPSDForm.get('isProductOnTpsEcosysSelect').setValue(isProductOnTps ? 'yes' : 'no');
    if (isExistingRelease !== undefined) {
      this.createTPSDForm.get('isExistingOrNewReleaseSelect').setValue(isExistingRelease ? 'existing' : 'new');
    } else {
      this.isReleaseVersionAvailable = false;
    }
    const { product: { name } , version, csdlId } = this.tpsdProjectReleaseData;
    this.createTPSDForm.get('coronaProdName').setValue(name);
    this.createTPSDForm.get('releaseVersionText').setValue(version);
    if (this.isReinitiated && (!this.resProductRelease || !this.resProductRelease.length)) {
      this.selectedProductName = name;
      this.getLatestReleaseVersionList();
    }
    this.createTPSDForm.get('csdlId').setValue(csdlId);
  }

  disableFormControls() {
    Object.keys(this.createTPSDForm.controls).forEach(key => {
      this.createTPSDForm.controls[key].disable();
    });
  }

  getCoronaUrl() {
    this.tpsdService.getCoronaAndTpsUrlDataSub.pipe(takeUntil(this.destroy$)).subscribe((res: CoronaAndTpsUrlModel) => {
      if (res) {
        this.extCoronaLink = res.coronaUrl;
        this.tpsComplianceUrl = res.tpsUrl;
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching TPSCRM URL', 'danger');
    });
  }
  
  formValueChanges() {
    this.isProductOnEcoSystemValueChange();
    this.productNameValueChange();
    this.releasedVersionValueChanges();
  }

  isProductOnEcoSystemValueChange() {
    this.createTPSDForm.get('isProductOnTpsEcosysSelect').valueChanges.subscribe(value => {
      if (!this.isProjectLinked) {
        if (value === 'yes') {
          if (!this.isReinitiated) {
            this.showReleaseInfo = false;
            this.isReleaseVersionAvailable = true;
            this.createTPSDForm.get('coronaProdName').setValue('');
            this.createTPSDForm.get('isExistingOrNewReleaseSelect').setValue('');
            this.createTPSDForm.get('releasedVersionList').setValue('');
          }
          this.createTPSDForm.get('isExistingOrNewReleaseSelect').enable();
          this.createTPSDForm.get('releasedVersionList').enable();
          this.createTPSDForm.get('releaseVersionText').disable();
          this.createTPSDForm.get('csdlId').disable();
        } else if (value === 'no') {
          if (!this.isReinitiated) {
            this.caronaProductsList = [];
            this.selectedProductName = '';
            this.showReleaseInfo = false;
            this.isReleaseVersionAvailable = false;
            this.createTPSDForm.get('coronaProdName').setValue('');
            this.createTPSDForm.get('releasedVersionList').setValue('');
          }
          this.createTPSDForm.get('releaseVersionText').enable();
          this.createTPSDForm.get('csdlId').enable();
          this.createTPSDForm.get('isExistingOrNewReleaseSelect').disable();
          this.createTPSDForm.get('releasedVersionList').disable();
        }
      }
    });
  }

  productNameValueChange() {
    this.createTPSDForm.get('coronaProdName').valueChanges.pipe(debounceTime(500)).subscribe((productName) => {
      if (!this.isReleaseDataRequested) {
        if (!this.isProjectLinked) {
          productName = productName.trim();
          if (this.createTPSDForm.value.isProductOnTpsEcosysSelect === 'yes') {
            if (productName) {
              this.loadingData = true;
              this.caronaProductsList = [];
              this.tpsdService.getAllProducts(productName).pipe(takeUntil(this.destroy$)).subscribe(res => {
                this.caronaProductsList = res.data.length ? res.data : ["No match found"];
                this.loadingData = false;
              }, () => {
                this.toastService.show('Error in data fetching', 'Error fetching the product list', 'danger');
                this.loadingData = false;
              });
            } else {
              this.caronaProductsList = [];
            }
          } else {
            this.showReleaseInfo = productName ? true : false;
          }
        }
      }
    });
  }

  releasedVersionValueChanges() {
    this.createTPSDForm.get('releasedVersionList').valueChanges.subscribe(value => {
      if (value && !this.isProjectLinked) {
        this.createTPSDForm.get('releaseVersionText').setValue(value);
        if (this.resProductRelease.length) {
          this.selectedVersionObject = this.resProductRelease.filter(element => {
            if (element.version === value) {
              return element;
            }
          });
        }
      }
    });
  }

  getLatestReleaseVersionList() {
    this.isReleaseDataRequested = true;
    this.createTPSDForm.get('releasedVersionList').setValue('');
    this.tpsdService.getProductReleases(this.selectedProductName).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.resProductRelease = getNestedKeyValue(res, 'data', 'content');
      this.isReleaseVersionAvailable = this.resProductRelease && this.resProductRelease.length > 0 ? true : false;
      if(this.resProductRelease && this.resProductRelease.length > 0)
      this.tpsComplianceProductUrl = this.tpsComplianceUrl + "/product/" + this.resProductRelease[0].productId;
      if (this.isReinitiated && getNestedKeyValue(this.tpsdProjectReleaseData, 'product', 'name') === this.selectedProductName) {
        this.createTPSDForm.get('releasedVersionList').setValue(this.tpsdProjectReleaseData.version);
      }
      if (this.isReleaseVersionAvailable) {
        this.showReleaseInfo = true;
        this.createTPSDForm.get('isExistingOrNewReleaseSelect').enable();
      } else {
        this.showReleaseInfo = false;
        this.versionReleaseLength = false;
        this.createTPSDForm.get('isExistingOrNewReleaseSelect').disable();
      }
      this.showLoader = false;
      setTimeout(() => {
        this.isReleaseDataRequested = false;
      }, 0);
    }, () => {
      setTimeout(() => {
        this.isReleaseDataRequested = false;
      }, 0);
      this.showLoader = false;
      this.toastService.show('Error in data fetching', 'Error fetching the version list', 'danger');
    });
  }

  getLatestReleaseVersionOnRefresh() {
    this.isReleaseDataRequested = true;
    this.createTPSDForm.get('releasedVersionList').setValue('');
    this.tpsdService.getProductReleases(this.selectedProductName).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.resProductRelease = getNestedKeyValue(res, 'data', 'content');
      if (this.resProductRelease && this.resProductRelease.length === 0) {
        this.versionReleaseLength = true;
      } else {
        this.versionReleaseLength = false;
      }
      this.showLoader = false;
      setTimeout(() => {
        this.isReleaseDataRequested = false;
      }, 0);
    }, () => {
      setTimeout(() => {
        this.isReleaseDataRequested = false;
      }, 0);
      this.showLoader = false;
      this.toastService.show('Error in data fetching', 'Error fetching the version list', 'danger');
    });
  }
   
  selectMatOption(selectedOption: string) {
    if (selectedOption !== "No match found") {
      if (this.selectedProductName !== selectedOption) {
        this.showLoader = true;
        this.selectedProductName = selectedOption;
        this.getLatestReleaseVersionList();
      }
    } else {
      this.createTPSDForm.get('coronaProdName').setValue('');
      this.selectedProductName = '';
    }
  }

  linkTpsdDetails() {
    this.showLoader = true;
    if (this.createTPSDForm.value.isProductOnTpsEcosysSelect === 'yes') {
      const requestObj = {
        productId: this.selectedVersionObject[0].productId,
        releaseId:  this.selectedVersionObject[0].releaseId,
        isProjectLinked: true,
        productReleaseDetails: {
          isProductOnTps: this.createTPSDForm.value.isProductOnTpsEcosysSelect === 'yes' ? true : false
        },
        'workflow.next': 'discover_register_execute',
        isReinitiated: false,
        projectId: this.tpsdDetails.projectId,
        "sendEmail": false
      };
      if (this.createTPSDForm.value.isExistingOrNewReleaseSelect !== undefined) {
        const isExistingRelease = "isExistingRelease";
        requestObj.productReleaseDetails[isExistingRelease] = this.createTPSDForm.value.isExistingOrNewReleaseSelect === 'existing' ? true : false;
      }
      this.tpsdService.updateTpsdObject(this.tpsdDetails._id, requestObj).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res && res.success) {
          this.toastService.show('Project details linked', `The <b>${this.createTPSDForm.value.coronaProdName}</b> with Release <b>${this.createTPSDForm.value.releasedVersionList}</b> is successfully linked.`, 'success');
          this.isNewlyLinked = true;
          this.tpsdService.updateTpsdDataWithSubject(res.data);
        }
      }, () => {
        this.showLoader = false;
        this.toastService.show('Error in data updating', 'Unable to update TPSCRM Product', 'danger');
      });

    } else if (this.createTPSDForm.value.isProductOnTpsEcosysSelect === 'no') {
      const loggedInCecID = this.userDetailsService.getLoggedInCecId();
      const requestObj = {
        newProduct: {
          name: this.createTPSDForm.value.coronaProdName,
          version: this.createTPSDForm.value.releaseVersionText,
          csdlId: this.createTPSDForm.value.csdlId.trim(),
          securityContact: loggedInCecID,
          engineeringContact: loggedInCecID,
          productAdmins: [loggedInCecID]
        },
        productReleaseDetails: {
          isProductOnTps: this.createTPSDForm.value.isProductOnTpsEcosysSelect === 'yes' ? true : false,
          isExistingRelease: this.createTPSDForm.value.isExistingOrNewReleaseSelect === 'existing' ? true : false
        },
        isProjectLinked: true,
        'workflow.next': 'discover_register_execute',
        isReinitiated: false
      };
      this.tpsdService.createNewProduct(this.tpsdDetails._id, requestObj).pipe(takeUntil(this.destroy$)).subscribe(newProductRes => {
        if (newProductRes && newProductRes.success) {
          const csdlIdValue = this.createTPSDForm.value.csdlId.trim();
          if(csdlIdValue) {
            this.toastService.show('Project details linked', `The <b>${this.createTPSDForm.value.coronaProdName}</b> with Release <b>${this.createTPSDForm.value.releaseVersionText}</b> and CSDL ID <b>${csdlIdValue}</b> is successfully linked.`, 'success');
          } else {
            this.toastService.show('Project details linked', `The <b>${this.createTPSDForm.value.coronaProdName}</b> with Release <b>${this.createTPSDForm.value.releaseVersionText}</b> is successfully linked.`, 'success');
          }
          this.isNewlyLinked = true;
          this.tpsdService.getTpsdData(this.tpsdDetails._id).pipe(takeUntil(this.destroy$)).subscribe(tpsdData => {
            this.tpsdService.updateTpsdDataWithSubject(tpsdData.data);
          }, () => {
            this.toastService.show('Error in data fetching', 'Error fetching TPSCRM Data', 'danger');
          });
        }
      }, (err) => {
        this.showLoader = false;
        this.toastService.show('Error in data updating', 'Unable to create new TPSCRM Product', 'danger');
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


